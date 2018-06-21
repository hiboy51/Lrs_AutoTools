import through from "through2";

module.exports = () => through.obj(function (file, encoding, callback) {
    if (file.isNull() || file.isStream()) {
        this.push(file);
        return callback();
    }

    let content = file.contents.toString("utf-8");
    content = JSON.parse(content);
    file.contents = Buffer.from(JSON.stringify(content, null, "    "));
    
    this.push(file);
    return callback();
});