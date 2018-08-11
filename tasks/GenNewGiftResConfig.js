/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 16:26:41 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-08-11 18:57:24
 */
import gulp from 'gulp';
import minimist from "minimist";
import PluginError from "plugin-error";
import filter_gift from "../plugins/filter_gift_file";
import gen_exml from "../plugins/gen_exml_res";
import gen_pic from "../plugins/gen_pic_res";
import path from "path";
import stringify from "../plugins/stringify";
import gen_icon from "../plugins/gen_icon_res";
import gen_icon_2 from "../plugins/gen_icon_res2";
import mod_json from "../plugins/modify_res_json";
import Utils from "../utils/utils";
import compress from "../plugins/tinify_png_jpg";
import { exec } from "child_process";
import fs from "fs";
import sizeOf from "image-size";

const $ = require("gulp-load-plugins")();
const GameBase_Root = "/Users/momo/game_base";
const Lrs_Root = "/Users/momo/lrs-h5";
const Host_Game_Root = "/Users/momo/host_game";
const Sounds_Root = "/Users/momo/allSoundsRes";
const CommonPath = "resource/common";
const res_json_path = path.join(GameBase_Root, CommonPath, "common.res.json");

const GiftID = {
    string: "gid",
    default: {gid: 0}
};

let args = minimist(process.argv.slice(2), GiftID);

gulp.task("compress_pic", done => {
    let gid = args.gid;
    let comp = !!args.comp;
    if (!gid) {
        throw new PluginError("compress_pic:id", "YOU MUST SPECIFY ONE OR MORE GIFT ID VIA --gid");
    }
    gid = gid.split(",");

    const assetPath = path.join(GameBase_Root, CommonPath, "assets/giftNew");

    if (!comp) {
        return done();
    }

    return gulp.src(path.join(assetPath, "**/*"))
            .pipe(filter_gift(gid))
            .pipe(P.filterEach((_, fp) => {
                let fn = path.basename(fp);
                return [".png", ".jpg"].some(e => fn.includes(e));
            }))
            .pipe(compress())
            .pipe(gulp.dest(assetPath));
});

gulp.task("gen_res_json", done => {
    args = minimist(process.argv.slice(2), GiftID);
    let gid = args.gid;
    if (!gid) {
        throw new PluginError("gen_res_b:id", "YOU MUST SPECIFY ONE OR MORE GIFT ID VIA --gid");
    }
    gid = gid.split(",");

    const skinPath = path.join(GameBase_Root, CommonPath, "skins");
    const assetPath = path.join(GameBase_Root, CommonPath, "assets/giftNew");
    return gulp.src([path.join(skinPath, "**/*.exml"), path.join(assetPath, "**/*")])
        .pipe(filter_gift(gid))
        .pipe($.debug())
        .pipe(gen_exml(res_json_path))
        .pipe(gen_pic(res_json_path))
        .pipe($.errorHandle());
});

gulp.task("beautify_res_json", done => {
    return gulp.src(res_json_path)
        .pipe(stringify())
        .pipe($.beautify({
            keep_array_indentation: true,
            brace_style: "expand",
            indent_size: 4,
            indent_char: " "
        }))
        .pipe(gulp.dest(path.join(GameBase_Root, CommonPath)))
        .pipe($.errorHandle());
});

gulp.task("gen_res_icons", done => {
    const iconDir = path.join(GameBase_Root, CommonPath, "assets/giftIcon");
    return gulp.src(path.join(iconDir, "**/*.json"))
                .pipe($.debug())
                .pipe(gen_icon(res_json_path))
                .pipe($.errorHandle());
});

gulp.task("gen_res_icons_2", done => {
    const iconDir = path.join(GameBase_Root, CommonPath, "assets/giftIcon");
    return gulp.src(path.join(iconDir, "**/*"))
                .pipe(gen_icon_2(res_json_path))
                .pipe($.errorHandle());
});

gulp.task("gift:clear_res_b", gulp.series(done => {
    args = minimist(process.argv.slice(2), GiftID);
    let gid = args.gid;
    if (!gid) {
         throw new PluginError("gift:clear_res_b", "YOU MUST SPECIFY ONE OR MORE GIFT ID VIA --gid");
    }
    gid = gid.split(",").filter(e => e != "");
    return gulp.src(res_json_path)
             .pipe($.jsonEditor(json => {
                 gid.forEach(id => {
                    let resources = json.resources;
                    let groups = json.groups;
                    let group = Utils.getGroup(json, id, false);
                    if (!group) {
                        console.log(`${id} not defined`);
                        return;    // 没有该组
                    }
                    
                    let keys = group.keys;
                    json.resources = resources.filter(r => keys.indexOf(r.name) == -1);
                    json.groups = groups.filter(g => g != group);
                 });
                 return json;
             }))
             .pipe(gulp.dest(path.join(GameBase_Root, CommonPath)));
 }, "beautify_res_json"));

/**
 *  生成合图文件
 *  --dir 源散图目录(可以多个)
 */

function getAlllDirectories(dir) {
    let stat = fs.lstatSync(dir);
    if (stat.isFile()) {
        return [];
    }
    let result = [];
    let files = fs.readdirSync(dir);
    files.forEach(f => {
        result = result.concat(getAlllDirectories(path.join(dir, f)));
    });
    if (result.length == 0) {
        result.push(dir);
    }
    return result;
}
gulp.task("gift:gen_sheet", gulp.series(done => {
    let dirs = args.dir;
    Utils.simulateArgs("--file", dirs);                     // 为了跟后续任务连用，这里使用一点trick保持语义上的一致性
    if (!dirs) {
        throw new PluginError("gift:gen_sheet", "YOU MUST SPECIFY ONE OR MORE DIRECTORIES CONTAIN SOURCE PICTURES");
    }
    dirs = dirs.split(",")
                .filter(e => e != "")
                .map(d => getAlllDirectories(d))
                .reduce((pre, cur) => pre.concat(cur));
    let dirLen = dirs.length;
    console.log(`${dirLen} dirs selected`);
    if (dirLen == 0) {
        return done();
    }

    let dir, ext, gid, matches,
    p, o, c;
    let gids = [];

    const designSize = {w:512, h:512};
    let checkSheetSize = () => {
        let f, dimensions;
        for (let g of gids) {
            f = path.join(GameBase_Root, CommonPath, "assets/giftNew", `gift_${g}.png`);
            dimensions = sizeOf(f);
            if (dimensions.width > designSize.w || dimensions.height > designSize.h) {
                console.log(`SHEET gift_${g}.png SIZE WARNING: ${dimensions.width} * ${dimensions.height}`);
            }
        }
    };

    let next = (index) => {
        if (index == dirLen) {
            Utils.simulateArgs("--gid", gids.join(","));    // 为了跟后续任务连用，这里使用有点trick保持语义上的一致性
            checkSheetSize();
            return done();
        }
        dir = dirs[index];
        let files = fs.readdirSync(dir);
        for (let f of files) {
            ext = path.extname(f);
            if ([".png", ".jpg"].indexOf(ext) == -1) {
                continue;
            } 
            matches = f.match(/^[^\d]*(\d*)(?:.*)?$/);
            if (matches != null) {
                gid = matches[1];
                break;
            }
        }
        console.log(`current gid: ${gid}`);
        gids.push(gid);
        
        p = dir;
        o =  path.join(GameBase_Root, CommonPath, "assets/giftNew", `gift_${gid}.json`);
        c = `textureMerger -p ${p} -o ${o}`;
        exec(c, (err, stdout, stderr) => {
           if (err) {
               console.log(err);
           } 
           next(++index);
        });
    };

    next(0);
}, "compress_pic"));

/**
 *  自动将新增礼物资源追加到common.res.json中
 *  必须指定参数--gid,以逗号隔开
 *  */
gulp.task("asset:gen_res_b", gulp.series("gift:clear_res_b", "gen_res_json", "beautify_res_json"));

/**
 * 自动更新icon图集到common.res.json中
 */
gulp.task("icon:gen_res_b", gulp.series("gen_res_icons", "beautify_res_json"));