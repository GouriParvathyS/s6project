import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import StudentModal from "./StudentModal";
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Badge, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Button, 
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  useMediaQuery,
  useTheme,
  CircularProgress,
  TextField,
  Alert
} from "@mui/material";
import { LibraryBooks, EmojiEvents, School } from "@mui/icons-material";

export default function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Store all students
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Class filtering state
  const [classUniqueId, setClassUniqueId] = useState("");
  const [currentClass, setCurrentClass] = useState(null);
  const [classError, setClassError] = useState("");
  const [showClassPrompt, setShowClassPrompt] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("student")
          .select("*");
        
        if (error) {
          console.error("Error fetching students:", error.message);
        } else {
          console.log("Fetched students:", data);
          
          // Process the data to format student IDs correctly
          const processedData = data.map(student => ({
            ...student,
            // Format the ID as KTU ID pattern (e.g., KTU1234)
            formattedId: student.ktu_id || `KTU${String(student.id).padStart(4, '0')}`
          }));
          
          setAllStudents(processedData || []);
        }
      } catch (err) {
        console.error("Exception fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedStudent(null);
    }, 300);
  };

  // Class verification function
  const verifyClassId = async () => {
    setLoading(true);
    setClassError("");
    
    try {
      // Verify the unique ID against class_identifiers table
      const { data, error } = await supabase
        .from("class_identifiers")
        .select("*")
        .eq("unique_id", classUniqueId)
        .single();
      
      if (error || !data) {
        setClassError("Invalid class ID. Please try again.");
        setLoading(false);
        return;
      }
      
      // Set the current class and filter students
      setCurrentClass(data);
      
      // Filter students by the selected class
      const filteredStudents = allStudents.filter(
        student => student.class === data.class_name
      );
      
      setStudents(filteredStudents);
      setShowClassPrompt(false);
      
    } catch (err) {
      console.error("Error verifying class ID:", err);
      setClassError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset class function
  const resetClass = () => {
    setCurrentClass(null);
    setStudents([]);
    setClassUniqueId("");
    setShowClassPrompt(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          Teacher Dashboard
        </Typography>
        {currentClass && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} />
            <Typography variant="h6" color="primary.main">
              Class: {currentClass.class_name}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={resetClass}
              sx={{ ml: 2 }}
            >
              Change Class
            </Button>
          </Box>
        )}
      </Box>

      {/* Class ID Prompt */}
      {showClassPrompt && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Enter Class ID
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please enter the unique ID for the class you want to view.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <TextField
              label="Class Unique ID"
              value={classUniqueId}
              onChange={(e) => setClassUniqueId(e.target.value)}
              variant="outlined"
              fullWidth
              placeholder="e.g. csa123"
              error={!!classError}
              helperText={classError}
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              onClick={verifyClassId}
              disabled={loading || !classUniqueId}
              sx={{ 
                bgcolor: 'black',
                '&:hover': { bgcolor: '#333' },
                height: '56px'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dashboard Content - Only show when class is selected */}
      {currentClass && (
        <>
          {/* Dashboard Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card 
                elevation={activeTab === 0 ? 4 : 1}
                onClick={() => handleTabChange(0)}
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  transform: activeTab === 0 ? 'scale(1.02)' : 'scale(1)',
                  border: activeTab === 0 ? `1px solid ${theme.palette.primary.main}` : 'none',
                  height: '100%'
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: '#f0f0f0', color: '#333', mr: 2 }}>
                    <EmojiEvents />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Activity Points
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track student engagement
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card 
                elevation={activeTab === 1 ? 4 : 1}
                onClick={() => handleTabChange(1)}
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'all 0.3s',
                  transform: activeTab === 1 ? 'scale(1.02)' : 'scale(1)',
                  border: activeTab === 1 ? `1px solid ${theme.palette.primary.main}` : 'none',
                  height: '100%'
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: '#f0f0f0', color: '#333', mr: 2 }}>
                    <LibraryBooks />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Scholarships
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage applications
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                {currentClass.class_name} Students
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {students.length} student{students.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table>
                  <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                    <TableRow>
                      <TableCell>SL NO</TableCell>
                      <TableCell>KTU ID</TableCell>
                      <TableCell>NAME</TableCell>
                      {activeTab === 0 ? (
                        <TableCell>TOTAL ACTIVITY POINTS</TableCell>
                      ) : (
                        <TableCell>NEW APPLICATIONS</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student, index) => (
                        <TableRow 
                          key={student.id} 
                          onClick={() => handleStudentClick(student)} 
                          sx={{ 
                            cursor: "pointer",
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } 
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.formattedId || `KTU${String(student.id).padStart(4, '0')}`}</TableCell>
                          <TableCell sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                            {student.name}
                          </TableCell>
                          {activeTab === 0 ? (
                            <TableCell>{student.total_activity_point || 0}</TableCell>
                          ) : (
                            <TableCell>
                              {student.newApplications > 0 ? 
                                <Badge color="error" badgeContent={student.newApplications} /> : 
                                "No New Applications"}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          <Typography>No students found in this class</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Paper>
        </>
      )}

      {/* Student Activity Points Modal */}
      {isModalOpen && selectedStudent && (
        <StudentModal
          open={isModalOpen}
          onClose={handleModalClose}
          student={selectedStudent}
        />
      )}

      {/* Other existing modals remain unchanged */}
      {selectedStudent && activeTab === 1 && (
        <Dialog 
          open={isModalOpen} 
          onClose={handleModalClose} 
          fullWidth 
          maxWidth="md"
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
            {selectedStudent.name}'s Scholarships
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                <TableRow>
                  <TableCell>Scholarship</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(selectedStudent.scholarships || []).length > 0 ? (
                  (selectedStudent.scholarships || []).map((scholarship, index) => (
                    <TableRow 
                      key={index} 
                      onClick={() => setSelectedScholarship(scholarship)} 
                      sx={{ 
                        cursor: "pointer",
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <TableCell>{scholarship.name}</TableCell>
                      <TableCell>{scholarship.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                      <Typography>No scholarships found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleModalClose} 
                variant="contained" 
                color="primary"
              >
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Scholarship Details Modal */}
      {selectedScholarship && (
        <Dialog 
          open={!!selectedScholarship} 
          onClose={() => setSelectedScholarship(null)} 
          fullWidth 
          maxWidth="md"
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
            {selectedScholarship.name} Details
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1" paragraph>
              <strong>Status:</strong> {selectedScholarship.status}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Details:</strong> {selectedScholarship.details || 'No details available'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                onClick={() => setSelectedScholarship(null)}
                variant="contained" 
                color="primary"
              >
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}