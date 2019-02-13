const util = {
    padZero: function(num, zeros) {
        num = num.toString();
        while(num.length < zeros){
            num = "0" + num;
        }
        return num
    },
    tcToFrames: function(str) {
        const fps= 25;
        const units = str.split(":").map(num => parseInt(num, 10));
        let frames = (units[0]*3600 + units[1]*60 + units[2])*fps+units[3];
        return frames
    },
    framesToTC: function(frames) {
        const fps= 25;
        let sec = Math.floor(frames/25);
        frames -= sec*fps;
        let fr = frames%25
        let min = Math.floor(sec/60);
        sec -= min*60;
        let hour = Math.floor(min/60);
        min -= hour*60;
        return `${this.padZero(hour, 2)}:${this.padZero(min,2)}:${this.padZero(sec,2)}:${this.padZero(fr,2)}`
    },
    offsetSourceClipTC: function(tcLine) {
        const startTime= "00:00:00:00";
        const lineArr = tcLine.split(/\s+/);               
        const origStartFrame = this.tcToFrames(lineArr[4]);
        const origEndFrame = this.tcToFrames(lineArr[5]);
        const newStartFrame = this.tcToFrames(startTime);
        const frameOffset = origStartFrame - newStartFrame;
        const newEndTime = framesToTC(origEndFrame - frameOffset);
        return `${lineArr[0]}  ${lineArr[1]}       V  ${lineArr[3]}        ${startTime} ${newEndTime} ${lineArr[6]} ${lineArr[7]}`
    }
}


// module.exports = util