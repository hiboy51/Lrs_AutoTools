# Lrs_AutoTools
  每天开一堆文件夹复制来复制去，脑壳都搞晕！

### [先安装 node.js 和 gulp 环境](https://gulpjs.com/)

### 术语说明
  **所有关联**：common目录 + player代码

### 几个重要任务

  #### 自动构建
  *  (default) gulp --dir --comp                   
  // default任务，从原图目录生成合图（压缩），拷贝相关文件到GameBase，注册相应common.res.json，并将`所有关联`同步给Lrs, 必须指定 __--dir__
     __--comp__ 是否压缩合图    

  *  gulp gift:gen_sheet --dir    
  // 自动合图，自动提取文件名中的*gid*,生成的礼物合图(gift_*gid*.json)将拷贝到GameBase里。 __--dir__ 指定原图目录（可以多个，以逗号隔开）   
  
  *  gulp gift:gen_res --dir  --comp        
  // 同default,只在GameBase中处理   

  * gulp gift:clear_res_b --gid    
  // 删除指定 __gid__ 的礼物资源配置    
  
  *  gulp sounds:added               
  // 根据Lrs里新增的音效资源,同步GameBase并补充其common.res.json，可选参数 __--delete__ 同步删除common.res.json中没有的资源项   

  * gulp sounds:modify --file --del   
  // 添加或覆盖新的音效资源到base，生成对应的res.json并同步给lrs、allSounds,最后同步common到lrs。__--file__, __--del__,参见sounds:cpy_src   
  
  * gulp decoration:add --dir   
  // 处理新增装饰道具（聊天框，头像框，入场特效框）。拷贝指定目录下的资源到对应目录，并补充对应的res.json文件   
  
  #### 拷贝同步
  *  gulp sounds                
  // 同步GameBase中所有音效文件到 Lrs 和 allSounds
  
  *  gulp gift:b2l              
  // 同步GameBase资源及代码 => Lrs， 不包括音效
  
  *  gulp gift:l2b              
  // 同步Lrs资源及代码 => GameBase, 不包括音效
  
  *  gulp gift:player_b2l       
  // 同步GameBase代码 => Lrs
  
  *  gulp gift:player_l2b       
  // 同步Lrs代码 => GameBase
  
  *  gulp gift:common_b2l       
  // 同步GameBase资源 => Lrs, 不包括音效
  
  *  gulp gift:common_l2b      
  // 同步Lrs资源 => GameBase, 不包括音效   
  
 ### 快捷文件替换
  *  gulp gift:cpy_src --dir     
  // 拷贝原图，必须指定（__--dir__）源路径，可以多个以逗号隔开
  
  * gulp gift:up_conf --file --del                
  // 替换GameBase和lrs的giftConfig.json，必须指定（__--file__）源路径或包含源文件目录, __--del__ 默认值 __true__，标识拷贝后删除源文件
  
  * gulp gift:up_skin --file --del                
  // 替换GameBase和lrs的动画文件(.exml)，必须指定（__--file__）源路径或包含源文件目录 __`一个或多个，以逗号隔开`__ , __--del__ 默认值 __false__，标识拷贝后删除源文件

  * gulp sounds:cpy_src --file --del    
  // 替换音效资源到GameBase、lrs、allSounds， 必须指定(__--file__)一个或多个音效文件路径(或目录)，以逗号隔开，__--del__ 标识拷贝后删除源文件

### 处理皮肤
  * gulp skin:add --dir --name

### 最佳实践
  1. __`gulp --dir --comp`__ 处理资源文件（自动合图，图片压缩，生成配置,同步模块） 
  2. 修改 __`giftEffcetGift.ts`__  增加播放礼物的逻辑
  3. __`gulp gift:player_b2l`__ 或 __`gulp gift:player_l2b`__  同步 __`giftEffectGift.ts`__    
  4. __`gulp sounds:modify --file`__ 处理新增音效资源,并同步    

  * 调整配置:__`gulp gift:up_conf --file`__
  * 调整动画:__`gulp gift:up_skin --file`__
  * 将原图归档:__`gulp gift:cpy_src --dir`__   
  * 替换音效:__`gulp sounds:cpy_src --file --del`__
