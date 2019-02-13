// const util = require('./utils/util');
// const fileIn = require('./components/file-in');

const startTime = "00:00:00:00";
const fps = 25;
const dropArea = document.querySelector('.edl__file-zone');
const manualFile = document.getElementById('file-in');
const link = document.getElementById("file");
let dropped = 0;

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.add('edl__file-zone--active');
});

dropArea.addEventListener("dragleave", e => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove('edl__file-zone--active');
  // dropped = 0;
});

dropArea.addEventListener("drop", e => {
  e.preventDefault();
  e.stopPropagation();
  dropArea.classList.remove('edl__file-zone--active');
  const file = e.dataTransfer.files[0];
  dropped += 1;
  fileChecker(file);
  // dropped = 0;
});

link.addEventListener("change", e => {
  e.preventDefault();
  e.stopPropagation();
  const file = e.srcElement.files[0];
  // console.log(link.value)

  // const file = e.dataTransfer.files[0];
  // console.log(file);
  dropped += 1;
  fileChecker(file);
})



function fileChecker(file) {
  const fileSplit = file.name.split(".");
  const ext = fileSplit[fileSplit.length-1];
  if(ext !== "edl") {
    alert("Elige un EDL, por favor")
  }
  if(dropped == 1) {
    // alert("file dropped");
    let fileName = file.name;
    let read = new FileReader();
    read.onload = function() {
      // updateButton(fileName);
      const content = read.result.split("\n")
      .map((line, idx, arr) => {
          if(idx > 1 && arr[idx-1].length <= 1)  {

              return offsetSourceClipTC(line)
          }else{
              return line
          } 
      })
      .reduce((accum, val) => {
          return accum += val + "\n"
      }, "");
      const file = `${fileName.split(".")[0]}_rev.edl`;
      download(content, file);
      dropped = 0;
    }
    read.readAsText(file);
  }

  
}

function tcToFrames (str) {
  const units = str.split(":").map(num => parseInt(num, 10));
  let frames = (units[0]*3600 + units[1]*60 + units[2])*fps+units[3];
  return frames
}

function framesToTC (frames) {
  let sec = Math.floor(frames/25);
  frames -= sec*fps
  let fr = frames%25
  let min = Math.floor(sec/60);
  sec -= min*60;
  let hour = Math.floor(min/60);
  min -= hour*60;
  return `${padZero(hour, 2)}:${padZero(min,2)}:${padZero(sec,2)}:${padZero(fr,2)}`
}

function offsetSourceClipTC(tcLine) {
  
  const lineArr = tcLine.split(/\s+/);               
  const origStartFrame = tcToFrames(lineArr[4]);
  const origEndFrame = tcToFrames(lineArr[5]);
  const newStartFrame = tcToFrames(startTime);
  const frameOffset = origStartFrame - newStartFrame;
  const newEndTime = framesToTC(origEndFrame - frameOffset);
  return `${lineArr[0]}  ${lineArr[1]}       V  ${lineArr[3]}        ${startTime} ${newEndTime} ${lineArr[6]} ${lineArr[7]}`
}

function padZero(num, zeros) {
  num = num.toString();
  while(num.length < zeros){
      num = "0" + num;
  }
  return num
}

function download(text, filename) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function updateButton(str) {
  fileBtn.innerHTML = str;
}