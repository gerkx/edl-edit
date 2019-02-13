const fileIn = {
    readFile: function(file) { 
        let fileName = file.name;
        let read = new FileReader();
        read.onload = function() {
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
            download(content, "boop.edl");
        }
        read.readAsText(file);
    }
}

module.exports = fileIn