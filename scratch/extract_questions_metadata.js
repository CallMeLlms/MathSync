const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '../content/game-data');
const OUTPUT_FILE = path.join(__dirname, 'question_bank_audit.md');

const groupQuestions = (data) => {
  const result = {};

  data.questions.forEach(q => {
    const topic = q.topic.toLowerCase().replace(/\s+/g, "-");

    if (!result[topic]) {
      result[topic] = { svg: [], text: [] };
    }

    if (q.assetType === "text") {
      result[topic].text.push(q.question);
    } else {
      result[topic].svg.push(q.question);
    }
  });

  return result;
};

const getJsonFiles = (dir, files = []) => {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getJsonFiles(fullPath, files);
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  });
  return files;
};

const main = () => {
  console.log(`Searching for question banks in: ${CONTENT_DIR}`);
  const files = getJsonFiles(CONTENT_DIR);
  console.log(`Found ${files.length} JSON files.`);

  const auditData = {};

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(content);
      
      if (data && data.questions && Array.isArray(data.questions)) {
        const relativePath = path.relative(CONTENT_DIR, file);
        auditData[relativePath] = groupQuestions(data);
      }
    } catch (err) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  });

  // Generate Markdown
  let mdContent = `# MathSync Question Bank Audit\n\n`;
  mdContent += `*Generated on: ${new Date().toLocaleString()}*\n`;
  mdContent += `*Total Banks Audited: ${files.length}*\n\n`;

  const sortedFiles = Object.keys(auditData).sort();

  sortedFiles.forEach(file => {
    mdContent += `## Bank: [${file}]\n\n`;
    
    const fileTopics = auditData[file];
    const sortedTopics = Object.keys(fileTopics).sort();

    sortedTopics.forEach(topic => {
      const data = fileTopics[topic];
      mdContent += `### Topic: ${topic}\n`;
      
      if (data.svg.length > 0) {
        mdContent += `#### SVG / Visual Questions (${data.svg.length})\n`;
        data.svg.forEach(q => mdContent += `- ${q}\n`);
      }

      if (data.text.length > 0) {
        mdContent += `#### Text-Only Questions (${data.text.length})\n`;
        data.text.forEach(q => mdContent += `- ${q}\n`);
      }
      mdContent += `\n`;
    });

    mdContent += `--- \n\n`;
  });

  fs.writeFileSync(OUTPUT_FILE, mdContent);
  console.log(`Audit report generated at: ${OUTPUT_FILE}`);
};

main();
