/*
 * @Author: Kinnon.Z 
 * @Date: 2018-07-02 20:24:51 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-02 20:43:15
 */
import through from "through2";
import path from "path";
import fs from "fs";
import Utils from "../utils/utils";
import beautify from "js-beautify";

module.exports = function(resJsonPath, modifyFunc) {
    return through.obj(function (file, encode, cb) {
        if (file.isNull() || file.isStream()) {
            this.push(file);
            cb();
        }
        let resJson = JSON.parse(fs.readFileSync(resJsonPath).toString("utf-8"));
        let groups = resJson.groups;
        let resources = resJson.resources;
        if (modifyFunc) {
            modifyFunc(file, groups, resources);
        }
        let content = beautify(JSON.stringify(resJson, null, "    "), {
            keep_array_indentation: true,
            brace_style: "expand",
            indent_size: 4,
            indent_char: " "
        }) ;
        fs.writeFileSync(resJsonPath, content);
        this.push(file);
        cb();
    });
};