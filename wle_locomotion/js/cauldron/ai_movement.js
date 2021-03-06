WL.registerComponent('ai-movement', {
    _myScale: { type: WL.Type.Float, default: 1.0 },
    _myMinSpeed: { type: WL.Type.Float, default: 1.0 },
    _myMaxSpeed: { type: WL.Type.Float, default: 3.0 },
    _myMinDirectionTime: { type: WL.Type.Float, default: 1.0 },
    _myMaxDirectionTime: { type: WL.Type.Float, default: 5.0 }

}, {
    start() {
        this._myCurrentDirection = [0, 0, 1];

        this._myChangeDirectionTimer = new PP.Timer(0);
        this._myChangeDirectionTimer.end();

        this._myCollisionTimer = new PP.Timer(1);
        this._myCollisionTimer.end();

        this._mySpeed = Math.pp_random(this._myMinSpeed, this._myMaxSpeed);

        this._myCollisionCheck = new CollisionCheck();
        this._myCollisionCheckParams = null;
        this._myCollisionRuntimeParams = new CollisionRuntimeParams();

        this._myFirstTime = true;

        this._changeDirection(false);
    },
    update(dt) {
        if (this._myFirstTime) {
            this._myFirstTime = false;

            this._setupCollisionCheckParams();
        }

        this._myChangeDirectionTimer.update(dt);
        this._myCollisionTimer.update(dt);

        if (this._myChangeDirectionTimer.isDone()) {
            this._changeDirection(false);
        }

        let up = this.object.pp_getUp();
        let movement = this._myCurrentDirection.vec3_scale(this._mySpeed * this._myScale * dt);
        movement.vec3_add(up.vec3_scale(-3 * this._myScale * dt), movement);

        let fixedMovement = this._myCollisionCheck.fixMovement(movement, this.object.pp_getTransformQuat(), this._myCollisionCheckParams, this._myCollisionRuntimeParams);

        if (fixedMovement.vec3_removeComponentAlongAxis(up).vec3_length() < 0.00001) {
            if (this._myCollisionTimer.isDone()) {
                this._myCollisionTimer.start();

                this._changeDirection(true);
            }
        }

        this.object.pp_translate(fixedMovement);
    },
    _changeDirection(goOpposite) {
        let up = this.object.pp_getUp();

        if (!goOpposite) {
            this._myCurrentDirection.vec3_rotateAxis(Math.pp_random(-180, 180), up, this._myCurrentDirection);
        } else {
            this._myCurrentDirection.vec3_rotateAxis(180, up, this._myCurrentDirection);
            this._myCurrentDirection.vec3_rotateAxis(Math.pp_random(-90, 90), up, this._myCurrentDirection);
        }

        this._myChangeDirectionTimer.start(Math.pp_random(this._myMinDirectionTime, this._myMaxDirectionTime));
    },
    _setupCollisionCheckParams() {
        this._myCollisionCheckParams = new CollisionCheckParams();

        this._myCollisionCheckParams.mySplitMovementEnabled = false;
        this._myCollisionCheckParams.mySplitMovementMaxLength = 0;

        this._myCollisionCheckParams.myRadius = 0.3 * this._myScale;
        this._myCollisionCheckParams.myDistanceFromFeetToIgnore = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceFromHeadToIgnore = 0.1 * this._myScale;

        this._myCollisionCheckParams.myHorizontalMovementStepEnabled = false;
        this._myCollisionCheckParams.myHorizontalMovementStepMaxLength = 0;
        this._myCollisionCheckParams.myHorizontalMovementRadialStepAmount = 1;
        this._myCollisionCheckParams.myHorizontalMovementCheckDiagonal = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckStraight = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckHorizontalBorder = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalStraight = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalDiagonal = true;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalStraightDiagonal = false;
        this._myCollisionCheckParams.myHorizontalMovementCheckVerticalHorizontalBorderDiagonal = false;

        this._myCollisionCheckParams.myHalfConeAngle = 60;
        this._myCollisionCheckParams.myHalfConeSliceAmount = 1;
        this._myCollisionCheckParams.myCheckConeBorder = true;
        this._myCollisionCheckParams.myCheckConeRay = true;

        this._myCollisionCheckParams.myFeetRadius = 0.1 * this._myScale;
        this._myCollisionCheckParams.myAdjustVerticalMovementWithSurfaceAngle = true;

        this._myCollisionCheckParams.mySnapOnGroundEnabled = true;
        this._myCollisionCheckParams.mySnapOnGroundExtraDistance = 0.1 * this._myScale;
        this._myCollisionCheckParams.mySnapOnCeilingEnabled = false;
        this._myCollisionCheckParams.mySnapOnCeilingExtraDistance = 0.1 * this._myScale;

        this._myCollisionCheckParams.myGroundCircumferenceSliceAmount = 4;
        this._myCollisionCheckParams.myGroundCircumferenceStepAmount = 1;
        this._myCollisionCheckParams.myGroundCircumferenceRotationPerStep = 22.5;
        this._myCollisionCheckParams.myGroundFixDistanceFromFeet = 0.1 * this._myScale;
        this._myCollisionCheckParams.myGroundFixDistanceFromHead = 0.1 * this._myScale;

        this._myCollisionCheckParams.myCheckHeight = true;
        this._myCollisionCheckParams.myHeightCheckStepAmount = 1;
        this._myCollisionCheckParams.myCheckVerticalStraight = true;
        this._myCollisionCheckParams.myCheckVerticalDiagonalRay = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorder = false;
        this._myCollisionCheckParams.myCheckVerticalDiagonalBorderRay = false;

        this._myCollisionCheckParams.myGroundAngleToIgnore = 30;
        this._myCollisionCheckParams.myCeilingAngleToIgnore = 30;

        let mesh = this.object.pp_getComponentHierarchy("mesh");
        this._myCollisionCheckParams.myHeight = mesh.object.pp_getScale()[1] * 2;

        this._myCollisionCheckParams.myDistanceToBeOnGround = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeGroundInfo = 0.1 * this._myScale;
        this._myCollisionCheckParams.myDistanceToBeOnCeiling = 0.001 * this._myScale;
        this._myCollisionCheckParams.myDistanceToComputeCeilingInfo = 0.1 * this._myScale;

        this._myCollisionCheckParams.mySlidingEnabled = false;
        this._myCollisionCheckParams.mySlidingHorizontalMovementCheckBetterNormal = true;
        this._myCollisionCheckParams.mySlidingMaxAttempts = 4;
        this._myCollisionCheckParams.mySlidingCheckBothDirections = false;       // expensive, 2 times the check for the whole horizontal movement!
        this._myCollisionCheckParams.mySlidingFlickeringPreventionType = 1;      // expensive, 2 times the check for the whole horizontal movement!

        this._myCollisionCheckParams.myBlockLayerFlags = new PP.PhysicsLayerFlags();
        this._myCollisionCheckParams.myBlockLayerFlags.setAllFlagsActive(true);
        let physXComponents = this.object.pp_getComponentsHierarchy("physx");
        for (let physXComponent of physXComponents) {
            this._myCollisionCheckParams.myObjectsToIgnore.pp_pushUnique(physXComponent.object, (first, second) => first.pp_equals(second));
        }

        this._myCollisionCheckParams.myDebugActive = false;
    },
    pp_clone(clonedObject, deepCloneParams, extraData) {
        let clonedComponent = clonedObject.pp_addComponent(this.type, {
            "_myScale": this._myScale,
            "_myMinSpeed": this._myMinSpeed,
            "_myMaxSpeed": this._myMaxSpeed,
            "_myMinDirectionTime": this._myMinDirectionTime,
            "_myMaxDirectionTime": this._myMaxDirectionTime
        });

        clonedComponent.active = this.active;

        return clonedComponent;
    }
});