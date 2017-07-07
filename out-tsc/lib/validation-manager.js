import { FormGroup, FormControl } from "@angular/forms";
import { Validators } from "./validators";
export var ValidationManager = (function () {
    function ValidationManager(inputsRaw, displayError) {
        var _this = this;
        if (displayError === void 0) { displayError = ['invalid', 'dirty', 'submitted']; }
        this.inputsRaw = inputsRaw;
        this.displayError = displayError;
        this.controls = {};
        this.formControls = {};
        this.errors = {};
        this.submitted = false;
        for (var key in this.inputsRaw) {
            this.controls[key] = this.buildControl(key, this.inputsRaw[key]);
            this.formControls[key] = this.controls[key].control;
            this.errors[key] = '';
        }
        this.formGroup = new FormGroup(this.formControls);
        this.formGroup.valueChanges.subscribe(function (data) { return _this.onValueChanged(); });
    }
    ValidationManager.prototype.getForm = function () {
        return this.formGroup;
    };
    ValidationManager.prototype.isValid = function () {
        this.submitted = true;
        this.onValueChanged();
        return !this.formGroup.invalid;
    };
    ValidationManager.prototype.hasError = function (field) {
        return this.errors[field] ? true : false;
    };
    ValidationManager.prototype.getError = function (field) {
        return this.errors[field];
    };
    ValidationManager.prototype.getErrors = function () {
        return this.errors;
    };
    ValidationManager.prototype.reset = function () {
        this.submitted = false;
        this.formGroup.reset();
    };
    ValidationManager.prototype.onValueChanged = function (displayError) {
        if (displayError === void 0) { displayError = null; }
        if (!this.formGroup) {
            return;
        }
        var form = this.formGroup;
        var _loop_1 = function(field) {
            var control = form.get(field);
            this_1.errors[field] = '';
            if (displayError == null)
                displayError = this_1.displayError;
            if (control && displayError.length && (displayError.every(function (element) { return (element == "submitted") ? true : control[element]; }) || this_1.submitted)) {
                for (var rule in control.errors) {
                    this_1.errors[field] = this_1.getErrorMessage(field, rule);
                }
            }
        };
        var this_1 = this;
        for (var field in this.errors) {
            _loop_1(field);
        }
    };
    ValidationManager.prototype.setValue = function (values, value) {
        if (value === void 0) { value = null; }
        if (typeof values == "string" && this.formGroup.get(values)) {
            if (value !== null) {
                this.formGroup.get(values).setValue(value.toString());
                this.formGroup.get(values).markAsTouched();
                this.formGroup.get(values).markAsDirty();
            }
        }
        if (typeof values == "object") {
            for (var key in values) {
                if (this.formGroup.get(key)) {
                    this.setValue(key, values[key]);
                }
            }
        }
    };
    ValidationManager.prototype.getValue = function (controlKey) {
        return this.formGroup.value[controlKey];
    };
    ValidationManager.prototype.getData = function () {
        return this.formGroup.value;
    };
    ValidationManager.prototype.buildControl = function (name, rules) {
        var _this = this;
        if (typeof rules == 'object')
            rules['rules'] = rules['rules'].split('|');
        if (typeof rules == 'string') {
            rules = {
                'rules': rules.split('|'),
                'value': ''
            };
        }
        var controlRules = [];
        var messages = {};
        rules.rules.forEach(function (rule) {
            if (rule) {
                var rule_spilted = rule.split(':');
                var rule_name = rule_spilted[0];
                var rule_vars = [];
                if (rule_spilted[1])
                    rule_vars = rule_spilted[1].split(',');
                if (!Validators[rule_name])
                    throw new TypeError('Validation rule [' + rule_name + '] does not exists.');
                if (rule_vars.length > 1)
                    controlRules.push(Validators[rule_name](rule_vars));
                else if (rule_vars.length == 1)
                    controlRules.push(Validators[rule_name](rule_vars[0]));
                else
                    controlRules.push(Validators[rule_name]);
                messages[rule_name.toLowerCase()] = _this.buildMessage(name, rule_name, rule_vars);
            }
        });
        var formControl = new FormControl(rules.value, controlRules);
        if (rules.value) {
            formControl.markAsTouched();
            formControl.markAsDirty();
        }
        return { control: formControl, messages: messages };
    };
    ValidationManager.prototype.getErrorMessage = function (field, rule) {
        //console.log('Message: '+this.controls[field].messages[rule.toLowerCase()] + ' Field:' + field + ' rule:'+ rule);
        if (!this.controls[field].messages[rule.toLowerCase()])
            throw Error('Message not found inside the control:' + field + ' message:' + rule.toLowerCase());
        return this.controls[field].messages[rule.toLowerCase()];
    };
    ValidationManager.prototype.setErrorMessage = function (field, rule, message) {
        if (this.controls[field].messages[rule.toLowerCase()])
            this.controls[field].messages[rule.toLowerCase()] = message;
    };
    ValidationManager.prototype.buildMessage = function (name, rule, arg) {
        if (arg === void 0) { arg = []; }
        if (!this.getMessage(rule))
            throw Error('Validation message is missing for: ' + rule);
        var message = this.getMessage(rule);
        message = message.replace(/%n/g, ucFirst(name)).replace('_', ' ');
        if (arg.length) {
            arg.forEach(function (arg, key) {
                message = message.replace('%' + key, arg);
            });
        }
        return message;
    };
    ValidationManager.prototype.getMessage = function (rule) {
        return VALIDATION_MESSAGES[rule.toLowerCase()];
    };
    return ValidationManager;
}());
//keys must be with lowercase
export var VALIDATION_MESSAGES = {
    'required': '%n is required',
    'minlength': '%n must be at least %0 characters long.',
    'maxlength': '%n cannot be more than %0 characters long.',
    'alpha': '%n accepts only alphabetic characters.',
    'alphaspace': '%n accepts only alphabetic characters and space.',
    'alphanum': '%n accepts only alphabetic characters and numbers.',
    'alphanumspace': '%n accepts only alphabetic characters, numbers and space.',
    'url': '%n is not valid url.',
    'number': '%n is not valid number.',
    'digits': '%n is not valid number.',
    'creditcard': '%n is not valid credit card.',
    'range': '%n must be between %0 and %1.',
    'rangelength': '%n must be between %0 and %1.',
    'max': '%n must be equal or lower then %0',
    'min': '%n must be equal or higher then %0',
    'email': '%n is not valid email.',
    'date': '%n is not valid date.',
    'mindate': 'The minimum date allowed in %n is %0',
    'maxdate': 'The maximum date allowed in %n is %0',
    'dateiso': '%n is not valid ISO date[yyyy-mm-dd].',
    'equal': '%n should be equal to %0',
    'equalto': '%n must be equal to %0',
    'json': '%n is not valid json.',
    'pattern': '%n is not matching the pattern.',
    'count': '%n must count %0'
};
function ucFirst(str) {
    var firstLetter = str.substr(0, 1);
    return firstLetter.toUpperCase() + str.substr(1);
}
//# sourceMappingURL=C:/xampp/htdocs/ng2-validation-manager/src/lib/validation-manager.js.map