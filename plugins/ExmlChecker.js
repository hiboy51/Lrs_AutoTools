/*
 * @Author: Kinnon.Z 
 * @Date: 2018-07-28 10:26:33 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-31 14:40:18
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
        if (exn != ".exml") {
            this.push(file);
            return callback();
        }

        let xmlContent = file.contents.toString("utf-8");
        let json = JSON.parse(convert.xml2json(xmlContent, {compact: true}));
        let root = json["e:Skin"];

        // 找出所有的UI组件ID
        let allIds = [];
        for (let g in root) {
            if (g == "w:Config" || g == "w:Declarations" || g == "_attributes") {
                continue;
            }
            let groups = root[g];
            allIds = allIds.concat(selectAllIds(groups));
        }

        // 遍历所有的动画配置
        let tween_group = root["w:Declarations"]["tween:TweenGroup"];   // TweenGroup可能有一个或多个
        if (!Array.isArray(tween_group)) {
            tween_group = [tween_group];
        }

        let errReportor = (leaf, allIds) => {
            let invalid = checkTargetId(leaf, allIds);
            if (invalid && errHandler) {
                errHandler(`EXML < ${path.basename(file.relative)} > HAS INVALID TARGET THAT NOT EXISTED: ${invalid}`);
            }
        };
        tween_group.forEach(tg => {
            for (let dec in tg) {
                if (dec == "_attributes") {
                    console.log((`start check group : ${tg[dec].id}`));
                    continue;
                }
                let each = tg[dec];
                if (Array.isArray(each)) {
                    for (let i of each) {
                        errReportor(i, allIds);
                    }
                }
                else {
                    errReportor(each, allIds);
                }
            }
        });

        this.push(file);
        return callback();
    });
};