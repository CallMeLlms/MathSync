import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/colors';

import assignmentService from '@/services/assignmentService';
import submissionService from '@/services/submissionService';

export default function AssignmentDetail() {
  const router = useRouter();
  const { assignmentId, sectionId } = useLocalSearchParams();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // File Picker states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignmentId, sectionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (sectionId && assignmentId) {
        const [assignRes, subRes] = await Promise.allSettled([
           assignmentService.getAssignmentDetails(sectionId, assignmentId),
           submissionService.getMySubmission(assignmentId)
        ]);

        if (assignRes.status === 'fulfilled') {
            setAssignment(assignRes.value);
        }

        if (subRes.status === 'fulfilled' && subRes.value) {
            setSubmission(subRes.value);
        }
      }
    } catch (error) {
      console.log('Error fetching assignment details', error);
      Alert.alert('Error', 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocuments = async () => {
     try {
         const result = await DocumentPicker.getDocumentAsync({
             multiple: true,
             copyToCacheDirectory: true
         });

         if (!result.canceled && result.assets) {
             const newFiles = [...selectedFiles, ...result.assets];
             if (newFiles.length > 3) {
                 Alert.alert('Limit Reached', 'You can only upload up to 3 attachments.');
                 setSelectedFiles(newFiles.slice(0, 3));
             } else {
                 setSelectedFiles(newFiles);
             }
         }
     } catch (error) {
         console.log('Error picking document:', error);
     }
  };

  const removeSelectedFile = (index) => {
     const updated = [...selectedFiles];
     updated.splice(index, 1);
     setSelectedFiles(updated);
  };

  const handleSubmit = async () => {
      if (selectedFiles.length === 0) {
          Alert.alert('Validation Error', 'Please select at least one file to submit.');
          return;
      }
      
      setSubmitting(true);
      try {
          const formData = new FormData();
          selectedFiles.forEach((file) => {
             formData.append('attachments', {
                 uri: file.uri,
                 name: file.name,
                 type: file.mimeType || 'application/octet-stream',
             });
          });

          const res = await submissionService.createSubmission(assignmentId, formData);
          
          Alert.alert('Success', 'Assignment submitted successfully!');
          // Re-fetch submission state
          setSubmission(res);
          setSelectedFiles([]);
      } catch (error) {
          Alert.alert('Submission Failed', error.message || 'Could not upload files.');
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) {
      return (
         <SafeAreaView style={[styles.container, styles.centered]}>
            <Stack.Screen options={{ title: 'Loading...' }} />
            <ActivityIndicator size="large" color={Colors.primary} />
         </SafeAreaView>
      );
  }

  if (!assignment) {
      return (
         <SafeAreaView style={[styles.container, styles.centered]}>
            <Stack.Screen options={{ title: 'Error' }} />
            <Text style={styles.emptyText}>Assignment not found.</Text>
         </SafeAreaView>
      );
  }

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Due Date';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
            title: 'Assignment',
            headerStyle: { backgroundColor: Colors.surface, elevation: 0, shadowOpacity: 0 },
            headerTitleStyle: { fontFamily: 'Lexend-Bold', fontSize: 18, color: Colors.onSurface },
            headerTintColor: Colors.primary,
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         
         {/* Assignment Header */}
         <View style={styles.cardInfo}>
            <Text style={styles.title}>{assignment.title}</Text>
            <View style={styles.metaRow}>
                <Text style={styles.metaText}>{assignment.points} Points</Text>
                <Text style={styles.metaText}>Due: {dueDate}</Text>
            </View>
            {assignment.instructions ? (
                <Text style={styles.instructions}>{assignment.instructions}</Text>
            ) : null}

            {/* Render Teacher Attachments if any */}
            {assignment.attachments && assignment.attachments.length > 0 && (
                <View style={styles.attachmentsArea}>
                   <Text style={styles.sectionHeader}>Reference Materials:</Text>
                   {assignment.attachments.map((att, idx) => (
                      <TouchableOpacity key={idx} style={styles.attachmentButton} onPress={() => Linking.openURL(att.url)}>
                         <Feather name="link" size={16} color={Colors.primary} />
                         <Text style={styles.attachmentText}>Attachment {idx + 1}</Text>
                      </TouchableOpacity>
                   ))}
                </View>
            )}

            {/* Rubric View */}
            {assignment.rubric && assignment.rubric.criteria && assignment.rubric.criteria.length > 0 && (
                <View style={styles.rubricArea}>
                   <Text style={styles.sectionHeader}>Grading Rubric:</Text>
                   {assignment.rubric.criteria.map((criterion, idx) => (
                      <View key={idx} style={styles.criterionCard}>
                         <Text style={styles.criterionTitle}>{criterion.title}</Text>
                         {criterion.description ? <Text style={styles.criterionDesc}>{criterion.description}</Text> : null}
                         
                         <View style={styles.levelsContainer}>
                            {criterion.levels && criterion.levels.map((lvl, lIdx) => (
                               <View key={lIdx} style={styles.levelCard}>
                                  <View style={styles.levelHeader}>
                                     <Text style={styles.levelTitle}>{lvl.title}</Text>
                                     <Text style={styles.levelScore}>{lvl.score} pts</Text>
                                  </View>
                                  {lvl.description ? <Text style={styles.levelDesc}>{lvl.description}</Text> : null}
                               </View>
                            ))}
                         </View>
                      </View>
                   ))}
                </View>
            )}
         </View>

         {/* Submission Area */}
         <View style={styles.submissionArea}>
            <Text style={styles.submitHeader}>Your Work</Text>

            {submission ? (
                <View style={styles.submittedCard}>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusText}>Status: </Text>
                        <View style={[styles.statusBadge, submission.status === 'graded' ? styles.statusBadgeGraded : styles.statusBadgePending]}>
                            <Text style={[styles.statusBadgeText, submission.status === 'graded' ? styles.statusTextGraded : styles.statusTextPending]}>
                                {submission.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    
                    {submission.grade !== undefined && (
                        <Text style={styles.gradeText}>Grade: {submission.grade} / {assignment.points}</Text>
                    )}
                    {submission.feedback ? (
                        <View style={styles.feedbackBox}>
                           <Text style={styles.feedbackTitle}>Teacher Feedback:</Text>
                           <Text style={styles.feedbackText}>{submission.feedback}</Text>
                        </View>
                    ) : null}

                    <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Submitted Files:</Text>
                    {submission.file && submission.file.map((f, idx) => (
                        <TouchableOpacity key={idx} style={styles.attachmentButton} onPress={() => Linking.openURL(f.url)}>
                            <Feather name="file" size={16} color={Colors.primary} />
                            <Text style={styles.attachmentText}>View File {idx + 1}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <View style={styles.uploadCard}>
                    {selectedFiles.length > 0 ? (
                        <View style={styles.selectedFilesList}>
                            {selectedFiles.map((file, idx) => (
                                <View key={idx} style={styles.selectedFileItem}>
                                   <Feather name="file" size={20} color={Colors.onSurfaceVariant} />
                                   <Text style={styles.selectedFileName} numberOfLines={1}>{file.name}</Text>
                                   <TouchableOpacity onPress={() => removeSelectedFile(idx)}>
                                      <Feather name="x-circle" size={20} color="#F44336" />
                                   </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noFilesText}>No files selected.</Text>
                    )}

                    <TouchableOpacity style={styles.pickButton} onPress={handlePickDocuments}>
                        <Feather name="upload" size={20} color={Colors.primary} />
                        <Text style={styles.pickButtonText}>Pick File</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                         style={[styles.submitButton, selectedFiles.length === 0 && styles.submitButtonDisabled]} 
                         onPress={handleSubmit}
                         disabled={selectedFiles.length === 0 || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Work</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
         </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Matches flat app background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  instructions: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 24,
  },
  attachmentsArea: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionHeader: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  rubricArea: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  criterionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  criterionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  criterionDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 12,
  },
  levelsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  levelCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  levelScore: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  levelDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  submissionArea: {
    marginTop: 10,
  },
  submitHeader: {
    fontFamily: 'Lexend-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginBottom: 16,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noFilesText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  selectedFilesList: {
    marginBottom: 16,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedFileName: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurface,
    marginLeft: 12,
    marginRight: 12,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  submittedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: Colors.onSurface,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgePending: { backgroundColor: 'rgba(255, 152, 0, 0.15)' },
  statusBadgeGraded: { backgroundColor: 'rgba(76, 175, 80, 0.15)' },
  statusBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
  },
  statusTextPending: { color: '#FF9800' },
  statusTextGraded: { color: '#4CAF50' },
  gradeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.onSurface,
    marginTop: 8,
    marginBottom: 16,
  },
  feedbackBox: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 8,
  },
  feedbackText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: Colors.onSurface,
    lineHeight: 22,
  }
});
