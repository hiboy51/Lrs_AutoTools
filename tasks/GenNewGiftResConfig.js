/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-20 16:26:41 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-20 15:05:35
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
import mod_json from "../plugins/modify_res_json";
import Utils from "../utils/utils";
import compress from "../plugins/tinify_png_jpg";
import { exec } from "child_process";
import fs from "fs";

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

/** 用于测试 */
gulp.task("tinify", done => {
    let file = args.file;
    
    return gulp.src(file)
            .pipe(compress())
            .pipe($.debug())
            .pipe(gulp.dest("/Users/momo/Downloads/张敬林"));
});

gulp.task("compress_pic", done => {
    let gid = args.gid;
    let comp = !!args.compress;
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
            .pipe(compress())
            .pipe(gulp.dest(assetPath));
});

gulp.task("gen_res_json", gulp.series("compress_pic", done => { 
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
}));

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

gulp.task("gift:clear_res_b", gulp.series(done => {
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
gulp.task("gift:gen_sheet", done => {
    let dirs = args.dir;
    if (!dirs) {
        throw new PluginError("gift:gen_sheet", "YOU MUST SPECIFY A OR MORE DIRECTORIES CONTAIN SOURCE PICTURES");
    }
    dirs = dirs.split(",").filter(e => e != "");

    let dirLen = dirs.length;
    let dir, ext, gid, matches,
        p, o, c;
        
    let next = (index) => {
        if (index == dirLen) {
            return done();
        }
        dir = dirs[index];
        let files = fs.readdirSync(dir);
        for (let f of files) {
            if (fs.lstatSync(path.join(dir, f)).isDirectory()) {
                continue;
            }
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
        
        p = dirs.join(" ");
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
});

/**
 *  自动将新增礼物资源追加到common.res.json中
 *  必须指定参数--gid,以逗号隔开
 *  */
gulp.task("asset:gen_res_b", gulp.series("gift:clear_res_b", "gen_res_json", "beautify_res_json"));

/**
 * 自动更新icon图集到common.res.json中
 */
gulp.task("icon:gen_res_b", gulp.series("gen_res_icons", "beautify_res_json"));