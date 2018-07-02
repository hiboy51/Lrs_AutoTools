/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 16:26:30 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-02 14:49:38
 */

import compareDir from "dir-compare";
import path from "path";

let utils =  {};
utils.compare_dir = function (left, right, ignore, printlog) {
    ignore = ignore || [];
    printlog = !!printlog || false;
    let result = compareDir.compareSync(left, right);
    let diffs = {"add":[], "delete":[]};
    result.diffSet.forEach(entry => {
        if (entry.state == "equal") {
            return;
        }
        let name1 = entry.name1 ? entry.name1 : '';
        let name2 = entry.name2 ? entry.name2 : '';
        let ext1 = path.extname(name1);
        let ext2 = path.extname(name2);
        if (!ignore.every(e => name1 != e && ext1 != e) || !ignore.every(e => name2 != e && ext2 != e)) {
            return;
        }
        
        if (entry.state == "left") {
            diffs.add.push(entry.name1);
        }
        if (entry.state == "right") {
            diffs.delete.push(entry.name2);

        }
        let state = {
            'equal' : '==',
            'left' : '->',
            'right' : '<-',
            'distinct' : '<>'
        }[entry.state];

        printlog && console.log(`${name1}(${entry.type1})${state}${name2}(${entry.type2})`);
    });
    return diffs;
};

utils.getGiftId = function (filename, type) {
    type = type || "skin";
    let prefix = type == "skin" ? `ani_gift_` : `gift_`;
    filename = filename.replace(prefix, "");
    let index = filename.indexOf("_");
    if (index < 0) {
        index = filename.indexOf(".");
    }
    let gid = filename.substring(0, index);

    return gid;
};

utils.getGroup = function (json, gid) {
    const gkey = `giftCom_${gid}`;
    let groups = json.groups;
    let gname;
    let curId;
    let len = groups.length;
    let pos = len - 1;
    for (let i in groups) {
        gname = groups[i].name;
        if (gname.indexOf("giftCom_") >= 0) {
            curId = gname.replace("giftCom_", "");
            if (Number(curId) >= Number(gid) && i < pos) {
                pos = i;
            }
        }
        if (gname == gkey) {
            return groups[i];
        }
    }
    let ng = {
        "keys": "",
        "name": gkey
    };
    console.log(`insert group ${gkey} at ${pos}`);
    groups.splice(pos, 0, ng);
    return ng;
};


/** 数组去重 */
utils.uniqueArray = function (array) {
    if (!Array.isArray(array)) {
        return [];
    }
    return array.filter((item, index, arr) => {
        return arr.indexOf(item) == index;
    });
};

/** 组合函数 */
utils.compose = function(f, g) {
    return (arg) => f(g(arg));
};

module.exports = utils;