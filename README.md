# Lrs_Gift_AutoTools
  每天开一堆文件夹复制来复制去，脑壳都搞晕！

### [先安装 node.js 和 gulp 环境](https://gulpjs.com/)

### 术语说明
  **所有关联**：common目录 + player代码

### 几个重要任务
  *  gulp                    
  // default任务，根据GameBase里新增的资源，补充相应common.res.json，并将`所有关联`同步给Lrs, 必须指定 --gid
  
  *  gulp gift:gen_res --gid aaa|aaa,bbb    
  // 根据GameBase里新增的资源，补充相应common.res.json, 必须指定 --gid
  
  *  gulp sounds:added (--delete)           
  // 根据Lrs里新增的音效资源,同步GameBase并补充其common.res.json，可选参数 --delete 同步删除common.res.json中没有的资源项
  
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

  * gulp sounds:modify --file --del   
  // 添加或覆盖新的音效资源到base，生成对应的res.json并同步给lrs、allSounds,最后同步common到lrs。__--file__, __--del__,参见sounds:cpy_src   
  
  * gulp decoration:added --dir   
  // 处理新增装饰道具（聊天框，头像框，入场特效框）。拷贝指定目录下的资源到对应目录，并补充对应的res.json文件   
  
 ### 快捷文件替换
  *  gulp gift:cpy_src --dir aaa|aaa,bbb      
  // 拷贝原图，必须指定（--dir）源路径，可以多个以逗号隔开
  
  * gulp gift:up_conf --file --del                
  // 替换GameBase和lrs的giftConfig.json，必须指定（--file）源路径或包含源文件目录, --del默认值 __true__，标识拷贝后删除源文件
  
  * gulp gift:up_skin --file --del                
  // 替换GameBase和lrs的动画文件(.exml)，必须指定（--file）源路径或包含源文件目录 __`一个或多个，以逗号隔开`__ , --del默认值 __false__，标识拷贝后删除源文件

  * gulp sounds:cpy_src --file --del    
  // 替换音效资源到GameBase、lrs、allSounds， 必须指定(--file)一个或多个音效文件路径，以逗号隔开，--del默认值true，标识拷贝后删除源文件

### 处理皮肤
  * gulp skin:add --dir --name

### 最佳实践
  1. 处理并拷贝图集到base    
  2. __`gulp gift:up_skin --dir`__  拷贝 __`.exml`__ 到 __base__   
  3. __`gulp --gid`__ 或者 __`gulp gift:gen_res --gid`__ 处理 __base__ 新增资源（同步到 __lrs__ )    
  4. 修改 __`giftEffcetGift.ts`__   
  5. __`gulp gift:player_b2l`__ 或 __`gulp gift:player_l2b`__  同步 __`giftEffectGift.ts`__    
  6. __`gulp sounds:modify --file`__ 处理新增音效资源,并同步    

  * 调整配置:__`gulp gift:up_conf --file`__
  * 调整动画:__`gulp gift:up_skin --file`__
  * 将原图归档:__`gulp gift:cpy_src --dir`__   
  * 替换音效:__`gulp sounds:cpy_src --file --del`__
