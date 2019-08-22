const teacher1 = { id: 'TEACHER1', name: 'TEACHER_1_NAME' };
const teacher2 = { id: 'TEACHER2', name: 'TEACHER_2_NAME' };

const teachersArr = [teacher1, teacher2];

const teachersObj = {
  [teacher1.id]: teacher1,
  [teacher2.id]: teacher2,
};

module.exports = {
  teacher1,
  teacher2,
  teachersArr,
  teachersObj,
};
