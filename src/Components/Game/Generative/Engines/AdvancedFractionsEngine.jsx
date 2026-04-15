import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';

import NumPad from '@/Components/Game/Global/Visualizers/NumPad';
import FractionVisual from '@/Components/Game/Global/Visualizers/FractionVisual';

/**
 * AdvancedFractionsEngine
 * 
 * Generative engine for advanced fraction problems (Grades 4-6).
 * Utilizes a numpad for direct fill-in-the-blank input.
 */
export default function AdvancedFractionsEngine({ problem, onAnswer, theme }) {
  const [inputNumerator, setInputNumerator] = useState("");
  const [inputDenominator, setInputDenominator] = useState("");
  const [activeField, setActiveField] = useState("numerator");
  const hasAnswered = useRef(false);

  // Reset inputs when problem changes
  useEffect(() => {
    setInputNumerator("");
    setInputDenominator("");
    setActiveField("numerator");
    hasAnswered.current = false;
  }, [problem?.answer]);

  if (!problem || !problem.metadata) return null;

  const { metadata, answer } = problem;
  const { type, fraction1, fraction2, displayQuestion, displayText } = metadata;

  // Handle Numpad key presses
  const handleKeyPress = (key) => {
    if (activeField === "numerator") {
      if (inputNumerator.length < 3) setInputNumerator(prev => prev + key);
    } else {
      if (inputDenominator.length < 3) setInputDenominator(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    if (activeField === "numerator") {
      setInputNumerator(prev => prev.slice(0, -1));
    } else {
      setInputDenominator(prev => prev.slice(0, -1));
    }
  };

  const canSubmit = inputNumerator.length > 0 && inputDenominator.length > 0;

  const handleSubmit = () => {
    console.log('[AdvancedFractionsEngine] handleSubmit pressed');
    if (!canSubmit || hasAnswered.current) return;
    hasAnswered.current = true;
    
    const userAnswer = `${inputNumerator}/${inputDenominator}`;
    const isCorrect = userAnswer === answer;
    console.log('[AdvancedFractionsEngine] Answer evaluation - isCorrect:', isCorrect);
    
    try {
      onAnswer(isCorrect, userAnswer);
    } catch (e) {
      console.error('[AdvancedFractionsEngine] onAnswer callback crash:', e);
    }
  };

  // Switch between numerator and denominator input focus
  const handleFieldSelect = (field) => {
    setActiveField(field);
  };

  // Render the problem payload dependent on the sub-type
  const renderProblemArea = () => {
    if (type === "add" || type === "subtract") {
      const operator = type === "add" ? "+" : "−";
      return (
        <View style={styles.problemContainer}>
          <FractionVisual numerator={fraction1.numerator} denominator={fraction1.denominator} theme={theme} />
          <Text style={[styles.operatorText, { color: theme.primaryColor, fontFamily: theme.fontFamily.title }]}>{operator}</Text>
          <FractionVisual numerator={fraction2.numerator} denominator={fraction2.denominator} theme={theme} />
          <Text style={[styles.operatorText, { color: theme.primaryColor, fontFamily: theme.fontFamily.title }]}>=</Text>
        </View>
      );
    }

    if (type === "simplify" || type === "equivalent") {
      return (
        <View style={styles.problemContainer}>
          <FractionVisual numerator={fraction1?.numerator || displayText.split('/')[0]} denominator={fraction1?.denominator || displayText.split('/')[1]} theme={theme} />
          <Text style={[styles.operatorText, { color: theme.primaryColor, fontFamily: theme.fontFamily.title }]}>{type === "simplify" ? '→' : '='}</Text>
        </View>
      );
    }

    if (type === "identify") {
      return (
        <View style={styles.problemContainer}>
          <Text style={[styles.identifyText, { fontFamily: theme.fontFamily.title, color: Colors.onSurface }]}>{displayText}</Text>
          <Text style={[styles.operatorText, { color: theme.primaryColor, fontFamily: theme.fontFamily.title }]}>→</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      
      {/* Question Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {displayQuestion || "Solve the fraction"}
        </Text>
      </View>

      {/* Payload Enclosure (Shadow-free, heavily bordered) */}
      <View style={styles.focusArea}>
        <View style={styles.visualEnclosure}>
          
          {/* Sub-generator Problem Content */}
          {renderProblemArea()}

          {/* Interactive Answer Input — split into numerator/denominator tap zones */}
          <View style={styles.inputContainer}>
            <View style={styles.inputBoxHolder}>
              <TouchableOpacity
                onPress={() => handleFieldSelect("numerator")}
                activeOpacity={0.8}
                style={[
                  styles.inputFieldZone,
                  activeField === "numerator" && { borderColor: theme.primaryColor, backgroundColor: `${theme.primaryColor}15` }
                ]}
              >
                <Text style={[styles.inputFieldText, { fontFamily: theme.fontFamily.accent, color: Colors.onSurface }]}>
                  {inputNumerator || "_"}
                </Text>
              </TouchableOpacity>

              <View style={[styles.fractionDivider, { backgroundColor: theme.primaryColor }]} />

              <TouchableOpacity
                onPress={() => handleFieldSelect("denominator")}
                activeOpacity={0.8}
                style={[
                  styles.inputFieldZone,
                  activeField === "denominator" && { borderColor: theme.primaryColor, backgroundColor: `${theme.primaryColor}15` }
                ]}
              >
                <Text style={[styles.inputFieldText, { fontFamily: theme.fontFamily.accent, color: Colors.onSurface }]}>
                  {inputDenominator || "_"}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.focusLabel, { fontFamily: theme.fontFamily.body, color: theme.primaryColor }]}>
                {activeField === "numerator" ? "Numerator" : "Denominator"}
              </Text>
            </View>
          </View>

        </View>
      </View>

      {/* NumPad Input mechanism */}
      <View style={styles.inputMechanismArea}>
        <NumPad 
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          theme={theme}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
  },
  focusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  visualEnclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    backgroundColor: Colors.surface,
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 3,
    borderBottomWidth: 8, // Tactile depth
    borderColor: Colors.outlineVariant,
    flexWrap: 'wrap',
  },
  problemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorText: {
    fontSize: 48,
    marginHorizontal: 12,
  },
  identifyText: {
    fontSize: 32,
    marginRight: 16,
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  inputBoxHolder: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
    minWidth: 100,
  },
  inputFieldZone: {
    minWidth: 72,
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  inputFieldText: {
    fontSize: 32,
  },
  fractionDivider: {
    width: 72,
    height: 3,
    borderRadius: 2,
    marginVertical: 6,
  },
  focusLabel: {
    position: 'absolute',
    bottom: -24,
    fontSize: 14,
  },
  inputMechanismArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
