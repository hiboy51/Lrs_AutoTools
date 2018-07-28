/*
 * @Author: Kinnon.Z 
 * @Date: 2018-06-21 10:45:06 
 * @Last Modified by: Kinnon.Z
 * @Last Modified time: 2018-07-27 19:42:59
 */

import path from "path";

const GameBase_Root = "/Users/momo/game_base";
const Lrs_Root = "/Users/momo/lrs-h5";
const Host_Game_Root = "/Users/momo/host_game";
const Sounds_Root = "/Users/momo/allSoundsRes";
const CommonPath = "resource/common";
const SoundsPath = path.join(CommonPath, "allSounds");
const GiftPlayerPath = "src/base/Tools/gift/GiftEffectPlayer.ts";


module.exports = {
    GameBase_Root: GameBase_Root,
    Lrs_Root: Lrs_Root,
    Lrs_Room: "resource/lrsRoom",
    Host_Game_Root: Host_Game_Root,
    Sounds_Root: Sounds_Root,
    CommonPath: CommonPath,
    SoundsPath: SoundsPath,
    GiftPlayerPath: GiftPlayerPath,
    Lrs_PictureSource_Path: path.join(Lrs_Root, "原图/room/giftAniRes180516"),
    Lrs_IconSource_Path: path.join(Lrs_Root, "原图/room/gift_group_4")
};