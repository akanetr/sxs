var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//=============================================================================
// Saba_MapTachie.js
//=============================================================================
/*:ja
 * @author Sabakan
 * @plugindesc マップ画面でも立ち絵を表示するプラグインです
 *
 *
 * @param tachieY
 * @desc 立ち絵を表示する時の y 座標です
 * @default 0
 *
 * @param appearX
 * @desc アクターコマンド選択中の x 座標です
 * @default 400
 *
 * @param hiddenX
 * @desc アクターコマンド非選択中の x 座標です
 * @default 900
 *
 * @param speed
 * @desc 立ち絵が移動する時の速度です
 * @default 150
 *
 * @param changeTachieButton
 * @desc 立ち絵切り替えボタンです
 * @default pagedown
 *
 * @param se
 * @desc 立ち絵切り替え時のSEです。ファイル名、ボリューム、ピッチの順です
 * @default Jump1 80 100
 *
 * @param skipActorList
 * @desc マップで立ち絵を表示しないアクターIDのリストです。空白区切り(2 3 4……など)
 * @default
 *
 * @param hideByMenu
 * @desc メニューを表示する時に背景の立ち絵を非表示にする場合、true に設定します
 * @default true
 *
 * @param hideByBattleEffect
 * @desc バトル演出を表示する時に背景の立ち絵を非表示にする場合、true に設定します
 * @default true
 *
 * @help
 * Ver 2016-04-29 23:35:17
 *
 * Saba_Tachie と併用してください
 *
 * @license
 * Saba_MapTachie licensed under the MIT License.
 */
var Saba;
(function (Saba) {
    var MapTachie;
    (function (MapTachie) {
        var parameters = PluginManager.parameters('Saba_MapTachie');
        var tachieY = parseInt(parameters['tachieY']);
        var appearX = parseInt(parameters['appearX']);
        var hiddenX = parseInt(parameters['hiddenX']);
        var speed = parseInt(parameters['speed']);
        var hideByMenu = parameters['hideByMenu'] === 'true';
        var hideByBattleEffect = parameters['hideByBattleEffect'] === 'true';
        var changeTachieButton = parameters['changeTachieButton'];
        var seList = parameters['se'].split(' ');
        var seFile = { name: seList[0], pan: 0, volume: parseInt(seList[1]), pitch: parseInt(seList[2]), pos: 0 };
        var skipActorList = Saba.toIntArray(parameters['skipActorList'].split(' '));
        var _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
        Spriteset_Map.prototype.createUpperLayer = function () {
            _Spriteset_Map_createUpperLayer.call(this);
            this._tachieSprite = new TachieSprite();
            this.addChild(this._tachieSprite);
        };
        var _Scene_Map_snapForBattleBackground = Scene_Map.prototype.snapForBattleBackground;
        Scene_Map.prototype.snapForBattleBackground = function () {
            if (hideByMenu) {
                this._spriteset.removeChild(this._spriteset._tachieSprite);
            }
            _Scene_Map_snapForBattleBackground.call(this);
        };
        var _Scene_Map_startEncounterEffect = Scene_Map.prototype.startEncounterEffect;
        Scene_Map.prototype.startEncounterEffect = function () {
            if (hideByBattleEffect) {
                this._spriteset.removeChild(this._spriteset._tachieSprite);
            }
            _Scene_Map_startEncounterEffect.call(this);
        };
        var _Scene_Map_terminate = Scene_Map.prototype.terminate;
        Scene_Map.prototype.terminate = function () {
            this._spriteset.removeChild(this._spriteset._tachieSprite);
            _Scene_Map_terminate.call(this);
        };
        var TachieSprite = (function (_super) {
            __extends(TachieSprite, _super);
            function TachieSprite() {
                var bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
                _super.call(this);
                this.hiddenX = hiddenX;
                this.appearedX = appearX;
                this.speed = speed;
                this.bitmap = bitmap;
                this.x = this.hiddenX;
                this.y = tachieY;
                if ($gameTemp.tahieMapLastPosX !== undefined) {
                    this.redraw();
                    this.x = $gameTemp.tahieMapLastPosX;
                    if (this.x == this.appearedX) {
                        this.hidden = false;
                    }
                }
            }
            TachieSprite.prototype.setActorCommandWindow = function (commandWindow) {
                this._commandWindow = commandWindow;
            };
            TachieSprite.prototype.update = function () {
                this.moveToTargetPosition();
                _super.prototype.update.call(this);
                this.updateTachie();
            };
            TachieSprite.prototype.updateInput = function () {
                if (Input.isTriggered(changeTachieButton)) {
                    AudioManager.playSe(seFile);
                    $gameSystem.mapTachieActorIndex++;
                    while (true) {
                        if ($gameParty.battleMembers().length <= $gameSystem.mapTachieActorIndex) {
                            $gameSystem.mapTachieActorIndex = -1;
                            break;
                        }
                        var actor = $gameParty.battleMembers()[$gameSystem.mapTachieActorIndex];
                        if (skipActorList.indexOf(actor.actorId()) >= 0) {
                            $gameSystem.mapTachieActorIndex++;
                        }
                        else {
                            break;
                        }
                    }
                }
            };
            TachieSprite.prototype.updateTachie = function () {
                if ($gameSystem.mapTachieActorIndex === undefined) {
                    $gameSystem.mapTachieActorIndex = 0;
                }
                var index = $gameSystem.mapTachieActorIndex;
                var actor = $gameParty.battleMembers()[index];
                if (!actor) {
                    this.hidden = true;
                    return;
                }
                if ($gameTemp.tachieAvairable) {
                    // 立ち絵つき会話が始まっている
                    this.hidden = true;
                    return;
                }
                if ($gameMap.isEventRunning()) {
                    // イベント実行中
                    this.hidden = true;
                    return;
                }
                this.updateInput();
                var id = actor.actorId();
                if (id != this.actorId) {
                    if (this.x == this.hiddenX) {
                        this.redraw();
                    }
                    else if (this.x == this.appearedX) {
                        this.hidden = true;
                    }
                }
                else {
                    if (this.hidden) {
                        this.redraw();
                        this.hidden = false;
                    }
                }
            };
            TachieSprite.prototype.redraw = function () {
                var index = $gameSystem.mapTachieActorIndex;
                var actor = $gameParty.battleMembers()[index];
                if (!actor) {
                    this.hidden = true;
                    return;
                }
                var id = actor.actorId();
                this.bitmap.clear();
                var success = this.drawTachie(id, this.bitmap);
                if (success) {
                    this.actorId = id;
                }
            };
            TachieSprite.prototype.moveToTargetPosition = function () {
                if (this.hidden) {
                    if (Math.abs(this.hiddenX - this.x) < this.speed) {
                        this.x = this.hiddenX;
                    }
                    else if (this.hiddenX > this.x) {
                        this.x += this.speed;
                    }
                    else {
                        this.x -= this.speed;
                    }
                }
                else {
                    if (Math.abs(this.appearedX - this.x) < this.speed) {
                        this.x = this.appearedX;
                    }
                    else if (this.appearedX > this.x) {
                        this.x += this.speed;
                    }
                    else {
                        this.x -= this.speed;
                    }
                }
                $gameTemp.tahieMapLastPosX = this.x;
            };
            return TachieSprite;
        }(Sprite_Base));
    })(MapTachie = Saba.MapTachie || (Saba.MapTachie = {}));
})(Saba || (Saba = {}));
