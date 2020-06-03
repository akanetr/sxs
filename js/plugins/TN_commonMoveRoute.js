//=============================================================================
// TN_commonMoveRoute.js
//=============================================================================
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
/*:
 * @plugindesc 移動ルート設定をコモンイベントで制御できるようにします。
 * @author terunon（エイリアスエイク）
 * @version 1.00
 *
 * @help
 * イベントの移動ルートの設定で、一行目に「this.toCommon(コモンイベントID)」と入れると
 * そのIDのコモンイベントに入れた「移動ルートの強制」内容が移動ルートとして設定されます。
 * 移動ルート設定用のコモンイベントには、
 * 移動ルートの強制以外のイベント（注釈を含む）を設定しないでください。
 * 
 * アクションRPGの作成時など、複数のイベントの挙動を一元管理したいときに便利です。
 *
 * -------------------------------------------------------------
 * 商用非商用・年齢制限問わず利用できます。
 * クレジットに「terunon（エイリアスエイク）」の記載をお願いします。
 * ※ 制作スタッフっぽく見える記載方法はご遠慮くださいね！
 *
 */

(function() {
'use strict';

Game_Event.prototype.toCommon = function(atype){
    if (atype){
        var data = $dataCommonEvents[atype].list[0].parameters[1];
        this.setMoveRoute({
            'repeat':data.repeat, 
            'skippable':data.skippable,
            'wait':data.wait,
            'list':data.list
        });
    }
};

})();
