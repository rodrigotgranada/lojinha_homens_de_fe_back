"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundMoney = roundMoney;
function roundMoney(val) {
    if (val === undefined || val === null || isNaN(val))
        return 0;
    return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}
//# sourceMappingURL=money.util.js.map