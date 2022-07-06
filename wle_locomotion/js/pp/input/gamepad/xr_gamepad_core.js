// xr-standard mapping is assumed
PP.XRGamepadCore = class XRGamepadCore extends PP.GamepadCore {

    constructor(handedness, handPoseParams = new PP.HandPoseParams()) {
        super(handedness);

        this._myHandPose = new PP.HandPose(this._myHandedness, handPoseParams);

        this._mySelectStart = false;
        this._mySelectEnd = false;
        this._mySqueezeStart = false;
        this._mySqueezeEnd = false;

        this._myIsXRSessionActive = false;
        this._myInputSource = null;
        this._myGamepad = null;
    }

    destroy() {
        // not implemented for now
    }

    getHandedness() {
        return this._myHandedness;
    }

    getHandPose() {
        return this._myHandPose;
    }

    isGamepadCoreActive() {
        //connected == null is to fix webxr emulator that leaves that field undefined
        return this._myIsXRSessionActive && this._myGamepad != null && (this._myGamepad.connected == null || this._myGamepad.connected);
    }

    start() {
        this._myHandPose.start();

        if (WL.xrSession) {
            this._onXRSessionStart(WL.xrSession);
        }
        WL.onXRSessionStart.push(this._onXRSessionStart.bind(this));
        WL.onXRSessionEnd.push(this._onXRSessionEnd.bind(this));
    }

    preUpdate(dt) {
        this._updateHandPose(dt);
    }

    postUpdate(dt) {
        this._mySelectStart = false;
        this._mySelectEnd = false;
        this._mySqueezeStart = false;
        this._mySqueezeEnd = false;
    }

    getButtonData(buttonType) {
        let buttonData = { pressed: false, touched: false, value: 0 };

        if (this.isGamepadCoreActive()) {
            if (buttonType < this._myGamepad.buttons.length) {
                let gamepadButton = this._myGamepad.buttons[buttonType];

                if (buttonType != PP.ButtonType.SELECT && buttonType != PP.ButtonType.SQUEEZE) {
                    buttonData.pressed = gamepadButton.pressed;
                } else {
                    buttonData.pressed = this._getSpecialButtonPressed(buttonType);
                }

                buttonData.touched = gamepadButton.touched;
                buttonData.value = gamepadButton.value;
            } else if (buttonType == PP.ButtonType.BOTTOM_BUTTON && this._myGamepad.buttons.length >= 3) {
                //This way if you are using a basic touch controller bottom button will work anyway
                let touchButton = this._myGamepad.buttons[2];
                buttonData.pressed = touchButton.pressed;
                buttonData.touched = touchButton.touched;
                buttonData.value = touchButton.value;
            }
        }

        return buttonData;
    }

    getAxesData() {
        let axes = [0.0, 0.0];

        if (this.isGamepadCoreActive()) {
            let internalAxes = this._myGamepad.axes;
            if (internalAxes.length == 4) {
                //in this case it could be both touch axes or thumbstick axes, that depends on the controller
                //to support both I simply choose the absolute max value (unused axes will always be 0)

                //X
                if (Math.abs(internalAxes[0]) > Math.abs(internalAxes[2])) {
                    axes[0] = internalAxes[0];
                } else {
                    axes[0] = internalAxes[2];
                }

                //Y
                if (Math.abs(internalAxes[1]) > Math.abs(internalAxes[3])) {
                    axes[1] = internalAxes[1];
                } else {
                    axes[1] = internalAxes[3];
                }

            } else if (internalAxes.length == 2) {
                axes[0] = internalAxes[0];
                axes[1] = internalAxes[1];
            }

            //y axis is recorder negative when thumbstick is pressed forward for weird reasons
            axes[1] = -axes[1];
        }

        return axes;
    }

    getHapticActuators() {
        let hapticActuators = [];

        if (this.isGamepadCoreActive()) {
            if (this._myGamepad.hapticActuators && this._myGamepad.hapticActuators.length > 0) {
                hapticActuators = this._myGamepad.hapticActuators;
            } else if (this._myGamepad.vibrationActuator) {
                hapticActuators.push(this._myGamepad.vibrationActuator);
            }
        }

        return hapticActuators;
    }

    _updateHandPose(dt) {
        this._myHandPose.update(dt);

        this._myInputSource = this._myHandPose.getInputSource();
        if (this._myInputSource != null) {
            this._myGamepad = this._myInputSource.gamepad;
        } else {
            this._myGamepad = null;
        }
    }

    //This is to be more compatible
    _getSpecialButtonPressed(buttonType) {
        let isPressed = false;

        if (this.isGamepadCoreActive()) {
            if (buttonType == PP.ButtonType.SELECT) {
                if (this._mySelectStart) {
                    isPressed = true;
                }
                if (this._mySelectEnd) {
                    isPressed = false;
                }
            } else if (buttonType == PP.ButtonType.SQUEEZE) {
                if (this._mySqueezeStart) {
                    isPressed = true;
                }

                if (this._mySqueezeEnd) {
                    isPressed = false;
                }
            }
        }

        return isPressed;
    }

    _onXRSessionStart(session) {
        session.addEventListener("selectstart", this._selectStart.bind(this));
        session.addEventListener("selectend", this._selectEnd.bind(this));

        session.addEventListener("squeezestart", this._squeezeStart.bind(this));
        session.addEventListener("squeezeend", this._squeezeEnd.bind(this));

        this._myIsXRSessionActive = true;
    }

    _onXRSessionEnd(session) {
        this._myIsXRSessionActive = false;
    }

    //Select and Squeeze are managed this way to be more compatible
    _selectStart(event) {
        if (this._myInputSource != null && this._myInputSource == event.inputSource) {
            this._mySelectStart = true;
        }
    }

    _selectEnd(event) {
        if (this._myInputSource != null && this._myInputSource == event.inputSource) {
            this._mySelectEnd = true;
        }
    }

    _squeezeStart(event) {
        if (this._myInputSource != null && this._myInputSource == event.inputSource) {
            this._mySqueezeStart = true;
        }
    }

    _squeezeEnd(event) {
        if (this._myInputSource != null && this._myInputSource == event.inputSource) {
            this._mySqueezeEnd = true;
        }
    }
};