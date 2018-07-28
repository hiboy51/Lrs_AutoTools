/*
 * @Author: Kinnon.Z 
 * @Date: 2018-07-28 10:26:33 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-28 13:55:08
 */
import through from "through2";
import path from "path";
import fs from "fs";
import Utils from "../utils/utils";
import convert from "xml-js";

function selectAllIds(jsonObj) {
    let result = [];
    if (jsonObj && jsonObj._attributes) {
        if (jsonObj._attributes.id) {
            result.push(jsonObj._attributes.id);
        }
    }
    for (var ele in jsonObj) {
        if (ele == "_attributes") {
            continue;
        }
        let cur = jsonObj[ele];
        if (Array.isArray(cur)) {
            cur.forEach(every => {
                result = result.concat(selectAllIds(every));
            });
        }
        else {
            result = result.concat(selectAllIds(cur));
        }
    }
    return result;
}

function checkTargetId(tweenItem, idArr) {
    let target = tweenItem._attributes.target;
    let targetID = target.substring(1, target.length - 1);
    if (idArr.indexOf(targetID) == -1) {
        return targetID;
    }
    return null;
}

module.exports = function(errHandler) {
    return through.obj(function(file, encode, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        let exn = path.extname(file.relative);
        if (exn == ".exml") {
            let xmlContent = file.contents.toString("utf-8");
            let json = JSON.parse(convert.xml2json(xmlContent, {compact: true}));
            let root = json["e:Skin"];
            let groups = root["e:Group"];
            let allIds = selectAllIds(groups);

            let tween_group = root["w:Declarations"]["tween:TweenGroup"];
            let invalid = false;
            for (let dec in tween_group) {
                if (dec == "_attributes") {
                    continue;
                }
                let each = tween_group[dec];
                if (Array.isArray(each)) {
                    for (let i of each) {
                        invalid = checkTargetId(i, allIds);
                        if (invalid) {
                            break;
                        }
                    }
                }
                else {
                    invalid = checkTargetId(each, allIds);
                }
                if (invalid && errHandler) {
                    errHandler(`EXML < ${path.basename(file.relative)} > HAS INVALID TARGET THAT NOT EXISTED: ${invalid}`);
                }
            }
            this.push(file);
        }
        callback();
    });
};