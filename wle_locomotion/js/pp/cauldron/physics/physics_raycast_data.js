PP.RaycastSetup = class RaycastSetup {
    constructor() {
        this.myOrigin = [0, 0, 0];
        this.myDirection = [0, 0, 0];
        this.myDistance = 0;

        this.myBlockLayerFlags = new PP.PhysicsLayerFlags();

        this.myObjectsToIgnore = [];
        this.myIgnoreHitsInsideCollision = false;
    }

    copy(setup) {
        this.myOrigin.vec3_copy(setup.myOrigin);
        this.myDirection.vec3_copy(setup.myDirection);
        this.myDistance = setup.myDistance;

        this.myBlockLayerFlags.copy(setup.myBlockLayerFlags);

        this.myObjectsToIgnore.pp_copy(setup.myObjectsToIgnore);
        this.myIgnoreHitsInsideCollision = setup.myIgnoreHitsInsideCollision;
    }
};

PP.RaycastResult = class RaycastResult {
    constructor() {
        this.myRaycastSetup = null;
        this.myHits = [];

        this._myUnusedHits = null;
    }

    isColliding(ignoreHitsInsideCollision = false) {
        return ignoreHitsInsideCollision ? this.getHitsOutsideCollision().length > 0 : this.myHits.length > 0;
    }

    getHitsInsideCollision() {
        let hits = [];

        for (let hit of this.myHits) {
            if (hit.myIsInsideCollision) {
                hits.push(hit);
            }
        }

        return hits;
    }

    getHitsOutsideCollision() {
        let hits = [];

        for (let hit of this.myHits) {
            if (!hit.myIsInsideCollision) {
                hits.push(hit);
            }
        }

        return hits;
    }

    copy(result) {
        if (result.myRaycastSetup == null) {
            this.myRaycastSetup = null;
        } else {
            if (this.myRaycastSetup == null) {
                this.myRaycastSetup = new PP.RaycastSetup();
            }

            this.myRaycastSetup.copy(result.myRaycastSetup);
        }

        if (this.myHits.length > result.myHits.length) {
            if (this._myUnusedHits == null) {
                this._myUnusedHits = [];
            }

            for (let i = 0; i < this.myHits.length - result.myHits.length; i++) {
                this._myUnusedHits.push(this.myHits.pop());
            }
        } else if (this.myHits.length < result.myHits.length) {
            if (this._myUnusedHits != null) {
                let length = Math.min(this._myUnusedHits.length, result.myHits.length - this.myHits.length);

                for (let i = 0; i < length; i++) {
                    this.myHits.push(this._myUnusedHits.pop());
                }
            }
        }

        this.myHits.pp_copy(result.myHits, function (currentElement, elementToCopy) {
            if (currentElement == null) {
                currentElement = new PP.RaycastResultHit();
            }

            currentElement.copy(elementToCopy);

            return currentElement;
        });
    }
};

PP.RaycastResultHit = class RaycastResultHit {
    constructor() {
        this.myPosition = [0, 0, 0];
        this.myNormal = [0, 0, 0];
        this.myDistance = 0;
        this.myObject = null;

        this.myIsInsideCollision = false;
    }

    isValid() {
        return this.myObject != null;
    }

    copy(hit) {
        this.myPosition.vec3_copy(hit.myPosition);
        this.myNormal.vec3_copy(hit.myNormal);
        this.myDistance = hit.myDistance;
        this.myObject = hit.myObject;
        this.myIsInsideCollision = hit.myIsInsideCollision;
    }

    reset() {
        this.myPosition.vec3_zero();
        this.myNormal.vec3_zero();
        this.myDistance = 0;
        this.myObject = null;
        this.myIsInsideCollision = false;
    }
};