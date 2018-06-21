/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-14 14:15:03 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-06-21 16:59:58
 */
import gulp from "gulp";
import path from "path";
import sequence from "gulp-sequence";
import merge_stream from "merge-stream";
import del from "promised-del";
import minimist from "minimist";
import je from "gulp-json-editor";
import stringify from "./plugins/stringify";
import requireDir from "require-dir";
import Utils from "./utils/utils";
import CONST from "./const";

const tasks = requireDir("./tasks");
const $ = require("gulp-load-plugins")();

const GameBase_Root = CONST.GameBase_Root;
const Lrs_Root = CONST.Lrs_Root;
const Host_Game_Root = CONST.Host_Game_Root;
const Sounds_Root = CONST.Sounds_Root;
const CommonPath = CONST.CommonPath;
const SoundsPath = CONST.SoundsPath;
const GiftPlayerPath = CONST.GiftPlayerPath;

function synSounds() {
    let from = path.join(GameBase_Root, SoundsPath, "**/*");
    let to = path.join(Sounds_Root, "allSounds");
    let to2 = path.join(Lrs_Root, SoundsPath);
    return gulp.src(from)
            .pipe(gulp.dest(to))
            .pipe(gulp.dest(to2));
}

gulp.task('common_res_b2l', function() {
    return gulp.src(path.join(GameBase_Root, CommonPath, "common.res.json"))
      .pipe(gulp.dest(path.join(Lrs_Root, CommonPath)));
});

gulp.task("clean_sounds", done => {
    return del([
        path.join(Sounds_Root, "allSounds", "**/*"),
        path.join(Lrs_Root, SoundsPath, "**/*")
    ], {force: true});
});

gulp.task("clean_gift_l", function () {
    let p = path.join(Lrs_Root, CommonPath, "**/*");
    console.log(p);
    return del([
        p
    ], {force:true});
});

gulp.task("clean_gift_b", function(done) {
    return del([
        path.join(GameBase_Root, CommonPath, "**/*")
    ], {force:true});
});

gulp.task("gift_player_l2b", done => {
    return gulp.src(path.join(Lrs_Root, GiftPlayerPath))
                .pipe(gulp.dest(path.dirname(path.join(GameBase_Root, GiftPlayerPath))));
});

gulp.task('gift_common_b2l', () => {
    let from = path.join(GameBase_Root, CommonPath, "**/*");
    let to = path.join(Lrs_Root, CommonPath);
    return gulp.src(from)
                .pipe(gulp.dest(to));
});

gulp.task('gift_common_l2b', () => {
    let from = path.join(Lrs_Root, CommonPath, "**/*");
    let to = path.join(GameBase_Root, CommonPath);
    return gulp.src(from)
                .pipe(gulp.dest(to));
});

gulp.task("gift_player_b2l", done => {
    return gulp.src(path.join(GameBase_Root, GiftPlayerPath))
                .pipe(gulp.dest(path.dirname(path.join(Lrs_Root, GiftPlayerPath))));
});



const Arguments = {
    string: "delete",
    default: {delete: false}
};
let args = minimist(process.argv.slice(2), Arguments);
gulp.task("sounds:gen_res", done => {
    const from = path.join(Lrs_Root, SoundsPath);
    const to = path.join(GameBase_Root, SoundsPath);
    let diffs = Utils.compare_dir(from, to, [".DS_Store"]);
    let supportDel = !!args.delete;
    return gulp.src(path.join(GameBase_Root, CommonPath, "common.res.json"))
            .pipe(je(json => {
                let groups = json.groups;
                let groupName;
                let keys;
                for (let i in groups) {                 
                    groupName = groups[i].name;
                    if (groupName == "sounds") {
                        keys = groups[i].keys;
                        if (diffs.add.length != 0) {            // 处理group字段
                            keys += "," + diffs.add.map(a => {
                                return a.replace(".", "_");
                            }).join(",");
                        } 
                        if (supportDel) {
                            diffs.delete.forEach(de => {
                                let key = `,${de.replace(".", "_")}`;
                                console.log(key);
                                keys = keys.replace(key, "");
                            });
                        }
                        groups[i].keys = keys;
                        break;
                    }
                }

                let resources = json.resources;         // 处理resources字段
                diffs.add.forEach(a => {
                    let obj = {};
                    obj.url = path.join("common/allSounds", a);
                    obj.type = "sound";
                    obj.name = a.replace(".", "_");
                    resources.push(obj);
                });
                if (supportDel) {
                    diffs.delete.forEach(del => {
                        let key = del.replace(".", "_");
                        for (let i in resources) {
                            if (resources[i].name == key) {
                                resources.splice(i, 1);
                                break;
                            }
                        }
                    });
                }
                return json;
            }))
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


/** 拷贝礼物资源及代码 gamebase => lrs */
gulp.task("gift_b2l", gulp.series("clean_gift_l", "gift_common_b2l", "gift_player_b2l"));

/** 拷贝礼物资源及代码 lsr => gamebase */
gulp.task("gift_l2b", gulp.series("clean_gift_b", "gift_common_l2b", "gift_player_l2b"));

/** 同步声音库 game_base => allSounds && lrs */
gulp.task("sounds", gulp.series("clean_sounds", "common_res_b2l", synSounds));

/** 将lrs新增的音效同步到game_base */
gulp.task("sounds:added", gulp.series("sounds:gen_res", () => {
    const to = path.join(GameBase_Root, SoundsPath);
    return  gulp.src(path.join(Lrs_Root, SoundsPath, "**/*"))
                .pipe($.changed(to, {hasChanged: $.changed.compareContents}))
                .pipe($.debug())
                .pipe(gulp.dest(to));
}));

/**
 * 自动注册礼物资源配置到common.res.json中
 * 包括动画资源和图标资源
 * 必须指定参数--gid，参见task <asset:gen_res_b>
 */
gulp.task("gift:gen_res", gulp.series("asset:gen_res_b", "icon:gen_res_b"));

/** 同gift_b2l */
gulp.task("default", gulp.series("gift_b2l"));