const tf = require('@tensorflow/tfjs-node');
const path = require('path');

// ตัวอย่างข้อมูลการฝึก
const userInput = tf.tensor2d([
  [1, 0, 1, 0],  // ตัวอย่างสำหรับผู้ใช้ 1
  [0, 1, 0, 1]   // ตัวอย่างสำหรับผู้ใช้ 2
]);

const articleInput = tf.tensor2d([
  [1, 0, 0, 0],  // บทความ 1
  [0, 1, 0, 0],  // บทความ 2
  [0, 0, 1, 0],  // บทความ 3
  [0, 0, 0, 1]   // บทความ 4
]);

// สร้างโมเดล
const model = tf.sequential();
model.add(tf.layers.dense({units: 10, activation: 'relu', inputShape: [4]}));
model.add(tf.layers.dense({units: 4, activation: 'softmax'}));

model.compile({
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// เทรนโมเดล
async function trainModel() {
  const history = await model.fit(userInput, articleInput, {
    epochs: 10,
    batchSize: 2
  });
  console.log('Training complete!');
}

const saveModel = async () => {
  const modelPath = path.join(__dirname, '../data/model'); // ตั้งค่าเส้นทางที่ถูกต้อง
  await model.save(`file://${modelPath}`);
  console.log('Model saved!');
};

// เรียกใช้งานฟังก์ชันการบันทึกและเทรนโมเดล
(async () => {
  await trainModel();
  await saveModel();
})();
