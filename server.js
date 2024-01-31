const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const uploadDir = path.join(__dirname, 'uploads');
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const filePath = req.file.path;
  let fileContent = fs.readFileSync(filePath, 'utf-8');

  // Применяем обе функции convertText и convertOtherText
  fileContent = convertText(fileContent);
  fileContent = convertOtherText(fileContent);

  fs.writeFileSync(filePath, fileContent, 'utf-8');

  res.send('File uploaded and processed successfully.');
});

// Функция convertText() для замены текста
function convertText(text) {
  var prepositions = [
    "в",
    "на",
    "за",
    "о",
    "об",
    "от",
    "при",
    "со",
    "до",
    "к",
    "из",
    "у",
    "во",
    "и",
    "а",
    "не",
    "с",
    
    "по",
    "а",
    "к"
  ];

  var regex = new RegExp("(\\s|^)(" + prepositions.join("|") + ") ", "g");
  text = text.replace(regex, "$1$2&nbsp;");

  text = text.replace(/—/g, "&nbsp;&mdash;");
  text = text.replace(/«/g, "&laquo;");
  text = text.replace(/»/g, "&raquo;");

  return text;
}

// Функция convertOtherText() для замены других частей текста
function convertOtherText(text) {
  const rules = [
    {
      regex: /на&nbsp;сайте/g,
      subst: '<a href="-----" style="border-bottom: 1px solid #d1d1d1; margin: 0; text-decoration: none; color: #7D838A; font-family: Arial, Helvetica, sans-serif; white-space: nowrap;" target="_blank">на сайте</a>'
    },
    {
      regex: /(ПАО Сбербанк)/gm,
      subst: '<span style="white-space: nowrap;">$1</span>'
    },
    {
      regex: /(ОГРН\s*\d{13})/gm,
      subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
    },
    {
        regex: /(адрес:\s*\d{6})/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(г\.\s*[А-Яа-яЁёA-Za-z]{3,}\s*)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(ул\.\s*[А-Яа-яЁёA-Za-z]{3,}\s*)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(пом\.\s*[А-Яа-яЁёA-Za-z]{3,}\s*)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(стр\.\s*[А-Яа-яЁёA-Za-z]+\s*)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(оф\.\s*[А-Яа-яЁёA-Za-z]{3,}\s*)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(д\.\s*\d+)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
      {
        regex: /(эт\.\s*\d+)/gm,
        subst: '<a class="link" border="0" style="margin:0; text-decoration:none; color:#7D838A; font-family: Helvetica, Arial, sans-serif; white-space: nowrap;">$1</a>'
      },
    
  ];

  for (const rule of rules) {
    text = text.replace(rule.regex, rule.subst);
  }

  // Применяем общее правило с использованием регулярного выражения
  const regex = /(\S*)&nbsp;(\S*)/gm;
  const subst = '<span style="white-space: nowrap;">$1&nbsp;$2</span>';
  text = text.replace(regex, subst);

  return text;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
