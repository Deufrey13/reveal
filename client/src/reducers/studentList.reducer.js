export default (studentList = [], action) => {
  if (action.type === 'setStudentList'){
    return action.list;
  } else {
    return studentList;
  }
}