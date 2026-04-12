import React from 'react';
import { View, Text, Image, StyleSheet, Linking, ScrollView, Dimensions } from 'react-native';
import OfflineVideoPlayer from './OfflineVideoPlayer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * RichTextRenderer component for rendering TipTap rich text content
 * @param {Object} props
 * @param {Object} props.content - The rich text content object from TipTap
 * @param {Object} props.styles - Custom styles to override defaults
 */
const RichTextRenderer = ({ content, styles = {} }) => {
  if (!content || typeof content === 'string') {
    return <Text style={[defaultStyles.paragraph, styles.paragraph]}>{content || ''}</Text>;
  }

  const jsonContent = content.data || content;

  if (!jsonContent || !jsonContent.content) {
    return <Text style={[defaultStyles.paragraph, styles.paragraph]}>{content.content || ''}</Text>;
  }

  return (
    <View style={[defaultStyles.container, styles.container]}>
      {renderNodes(jsonContent.content, styles)}
    </View>
  );
};

const renderNodes = (nodes, customStyles = {}, context = {}) => {
  if (!nodes || !nodes.length) return null;

  return nodes.map((node, index) => {
    return <React.Fragment key={index}>{renderNode(node, customStyles, context)}</React.Fragment>;
  });
};

const getTextAlignStyle = (textAlign) => {
  if (!textAlign) return {};
  switch (textAlign) {
    case 'left': return { textAlign: 'left' };
    case 'center': return { textAlign: 'center' };
    case 'right': return { textAlign: 'right' };
    case 'justify': return { textAlign: 'justify' };
    default: return {};
  }
};

// ── Table helpers ──────────────────────────────────────────
/**
 * Render a single table cell's inline content as a <Text> tree.
 * Cells contain paragraph nodes → we flatten them to avoid nested <Text> issues.
 */
const renderCellContent = (cellNode, customStyles = {}) => {
  if (!cellNode.content) return null;
  return cellNode.content.map((para, i) => {
    if (para.type === 'paragraph') {
      const align = getTextAlignStyle(para.attrs?.textAlign);
      return (
        <Text key={i} style={[defaultStyles.cellText, align]}>
          {para.content ? para.content.map((inline, j) => {
            if (inline.text) {
              let style = [defaultStyles.cellText];
              if (inline.marks) {
                inline.marks.forEach(mark => {
                  if (mark.type === 'bold') style.push(defaultStyles.bold);
                  if (mark.type === 'italic') style.push(defaultStyles.italic);
                  if (mark.type === 'underline') style.push(defaultStyles.underline);
                  if (mark.type === 'strike') style.push(defaultStyles.strikethrough);
                });
              }
              return <Text key={j} style={style}>{inline.text}</Text>;
            }
            return null;
          }) : null}
        </Text>
      );
    }
    return null;
  });
};

/**
 * Render a full table node.
 * Wraps in a horizontal ScrollView so wide tables don't clip on small screens.
 */
const renderTable = (node, customStyles = {}) => {
  if (!node.content) return null;

  const rows = node.content; // tableRow nodes
  const colCount = rows[0]?.content?.length || 1;
  const minCellWidth = Math.max(90, (SCREEN_WIDTH - 40) / colCount);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={defaultStyles.tableScrollView}
      contentContainerStyle={{ paddingBottom: 4 }}
    >
      <View style={defaultStyles.table}>
        {rows.map((row, rowIndex) => {
          const isHeaderRow = row.content?.some(cell => cell.type === 'tableHeader');
          return (
            <View
              key={rowIndex}
              style={[
                defaultStyles.tableRow,
                !isHeaderRow && rowIndex % 2 === 0 && defaultStyles.tableRowEven,
              ]}
            >
              {row.content?.map((cell, cellIndex) => {
                const isHeader = cell.type === 'tableHeader';
                return (
                  <View
                    key={cellIndex}
                    style={[
                      defaultStyles.tableCell,
                      { width: minCellWidth },
                      isHeader && defaultStyles.tableCellHeader,
                      cellIndex === 0 && defaultStyles.tableCellFirst,
                    ]}
                  >
                    {renderCellContent(cell, customStyles)}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
// ──────────────────────────────────────────────────────────

const renderNode = (node, customStyles = {}, context = {}) => {
  const { type, content, attrs, marks, text } = node;

  if (text) {
    const textStyle = context.inHeading || context.inParagraph || context.inBlockquote ? {} : defaultStyles.text;
    let textComponent = <Text style={textStyle}>{text}</Text>;

    if (marks && marks.length > 0) {
      return marks.reduce((TextComponent, mark) => {
        return applyMark(TextComponent, mark, customStyles);
      }, textComponent);
    }
    return textComponent;
  }

  switch (type) {
    case 'paragraph':
      const paragraphAlign = getTextAlignStyle(attrs?.textAlign);
      return (
        <Text style={[defaultStyles.paragraph, paragraphAlign, customStyles.paragraph]}>
          {content && renderNodes(content, customStyles, { inParagraph: true })}
        </Text>
      );

    case 'heading':
      const level = attrs?.level || 1;
      const headingStyle = getHeadingStyle(level, customStyles);
      const headingAlign = getTextAlignStyle(attrs?.textAlign);
      return (
        <Text style={[...headingStyle, headingAlign]}>
          {content && renderNodes(content, customStyles, { inHeading: true })}
        </Text>
      );

    case 'bulletList':
      return (
        <View style={defaultStyles.list}>
          {content && content.map((item, i) => (
            <View key={i} style={defaultStyles.bulletListItem}>
              <Text style={defaultStyles.bullet}>•</Text>
              <View style={defaultStyles.listItemContent}>
                {renderNode(item, customStyles, context)}
              </View>
            </View>
          ))}
        </View>
      );

    case 'orderedList':
      return (
        <View style={defaultStyles.list}>
          {content && content.map((item, i) => (
            <View key={i} style={defaultStyles.orderedListItem}>
              <Text style={defaultStyles.number}>{(attrs?.start || 1) + i}.</Text>
              <View style={defaultStyles.listItemContent}>
                {renderNode(item, customStyles, context)}
              </View>
            </View>
          ))}
        </View>
      );

    case 'listItem':
      return (
        <View style={[defaultStyles.listItem, customStyles.listItem]}>
          {content && renderNodes(content, customStyles, context)}
        </View>
      );

    case 'blockquote':
      const blockquoteAlign = getTextAlignStyle(attrs?.textAlign);
      return (
        <View style={[defaultStyles.blockquote, customStyles.blockquote]}>
          <View style={blockquoteAlign}>
            <Text style={defaultStyles.blockquoteText}>
              "{content && renderNodes(content, customStyles, { inBlockquote: true })}"
            </Text>
          </View>
        </View>
      );

    case 'image':
      if (attrs?.src?.startsWith('data:') && attrs.src.length < 100) {
        return null;
      }
      return (
        <View style={defaultStyles.imageContainer}>
          <Image
            source={{ uri: attrs?.src }}
            style={defaultStyles.image}
            resizeMode="contain"
          />
          {attrs?.alt && (
            <Text style={defaultStyles.imageCaption}>{attrs.alt}</Text>
          )}
        </View>
      );

    case 'hardBreak':
      return <Text>{'\n'}</Text>;

    case 'video':
      return <OfflineVideoPlayer url={attrs.src} />;

    // ── Table nodes ──────────────────────────────────────────
    case 'table':
      return renderTable(node, customStyles);

    // Fallbacks if cells surface at the top level for any reason
    case 'tableRow':
      return (
        <View style={defaultStyles.tableRow}>
          {content && renderNodes(content, customStyles, context)}
        </View>
      );

    case 'tableHeader':
      return (
        <View style={[defaultStyles.tableCell, defaultStyles.tableCellHeader]}>
          {renderCellContent(node, customStyles)}
        </View>
      );

    case 'tableCell':
      return (
        <View style={defaultStyles.tableCell}>
          {renderCellContent(node, customStyles)}
        </View>
      );
    // ─────────────────────────────────────────────────────────

    default:
      return content ? renderNodes(content, customStyles, context) : null;
  }
};

const applyMark = (TextComponent, mark, customStyles = {}) => {
  const { type, attrs } = mark;

  switch (type) {
    case 'bold':
      return <Text style={[defaultStyles.bold, customStyles.bold]}>{TextComponent}</Text>;
    case 'italic':
      return <Text style={[defaultStyles.italic, customStyles.italic]}>{TextComponent}</Text>;
    case 'underline':
      return <Text style={[defaultStyles.underline, customStyles.underline]}>{TextComponent}</Text>;
    case 'strike':
      return <Text style={[defaultStyles.strikethrough, customStyles.strikethrough]}>{TextComponent}</Text>;
    case 'link':
      return (
        <Text
          style={[defaultStyles.link, customStyles.link]}
          onPress={() => Linking.openURL(attrs?.href || '#')}
        >
          {TextComponent}
        </Text>
      );
    default:
      return TextComponent;
  }
};

const getHeadingStyle = (level, customStyles = {}) => {
  switch (level) {
    case 1:
      return [defaultStyles.heading1, customStyles.heading1];
    case 2:
      return [defaultStyles.heading2, customStyles.heading2];
    case 3:
      return [defaultStyles.heading3, customStyles.heading3];
    default:
      return [defaultStyles.heading1, customStyles.heading1];
  }
};

const defaultStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    color: '#37474F',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  paragraph: {
    marginBottom: 16,
    lineHeight: 26,
    fontSize: 16,
    color: '#37474F',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  heading1: {
    fontSize: 32,
    fontFamily: 'Lexend-Bold',
    marginBottom: 16,
    marginTop: 20,
    color: '#2C3E50',
  },
  heading2: {
    fontSize: 24,
    fontFamily: 'Lexend-SemiBold',
    marginBottom: 12,
    marginTop: 18,
    color: '#37474F',
  },
  heading3: {
    fontSize: 20,
    fontFamily: 'Lexend-Medium',
    marginBottom: 8,
    marginTop: 16,
    color: '#37474F',
  },
  list: {
    marginBottom: 16,
  },
  listItem: {
    marginBottom: 8,
  },
  bulletListItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderedListItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#37474F',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  number: {
    width: 24,
    fontSize: 16,
    lineHeight: 24,
    color: '#37474F',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  listItemContent: {
    flex: 1,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4', // MathSync accent color 
    paddingLeft: 16,
    marginLeft: 8,
    marginBottom: 16,
    backgroundColor: '#F5F7FA', // Surface background to mimic depth without shadow
    paddingVertical: 12,
    borderRadius: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  blockquoteText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontStyle: 'italic',
    color: '#78909C',
  },
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 40,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },
  imageCaption: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  bold: {
    fontFamily: 'PlusJakartaSans-Bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },

  // ── Table styles ──────────────────────────────────────────
  tableScrollView: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  table: {
    flexDirection: 'column',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tableRowEven: {
    backgroundColor: '#F5F7FA',
  },
  tableCell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#CFD8DC',
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
    justifyContent: 'center',
  },
  tableCellFirst: {
    borderLeftWidth: 0,
  },
  tableCellHeader: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
  },
  cellText: {
    fontSize: 14,
    color: '#37474F',
    fontFamily: 'PlusJakartaSans-Regular',
    lineHeight: 20,
    flexShrink: 1,
  },
  // ─────────────────────────────────────────────────────────
});

export default RichTextRenderer;
