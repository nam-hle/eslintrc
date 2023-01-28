/**
 * @fileoverview Config file operations. This file must be usable in the browser,
 * so no Node-specific code can be here.
 * @author Nicholas C. Zakas
 */
import { RuleConf, SeverityConf, SeverityNumber, SeverityString } from './types.js';

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

const RULE_SEVERITY_STRINGS: SeverityString[] = ['off', 'warn', 'error'];

const RULE_SEVERITY: Record<SeverityString, SeverityNumber> = {
    off: 0,
    warn: 1,
    error: 2
};
const VALID_SEVERITIES: (SeverityNumber | SeverityString)[] = [0, 1, 2, 'off', 'warn', 'error'];

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Normalizes the severity value of a rule's configuration to a number
 * @param {(number|string|[number, ...*]|[string, ...*])} ruleConfig A rule's configuration value, generally
 * received from the user. A valid config value is either 0, 1, 2, the string "off" (treated the same as 0),
 * the string "warn" (treated the same as 1), the string "error" (treated the same as 2), or an array
 * whose first element is one of the above values. Strings are matched case-insensitively.
 * @returns {(0|1|2)} The numeric severity value if the config value was valid, otherwise 0.
 */
function getRuleSeverity(ruleConfig: RuleConf): SeverityNumber {
    const severityValue = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;

    if (severityValue === 0 || severityValue === 1 || severityValue === 2) {
        return severityValue;
    }

    if (typeof severityValue === 'string') {
        return RULE_SEVERITY[severityValue.toLowerCase() as SeverityString] || 0;
    }

    return 0;
}

/**
 * Converts old-style severity settings (0, 1, 2) into new-style
 * severity settings (off, warn, error) for all rules. Assumption is that severity
 * values have already been validated as correct.
 * @param {Object} config The config object to normalize.
 * @returns {void}
 */
function normalizeToStrings(config: { rules?: Record<string, RuleConf> }) {
    const { rules } = config;
    if (rules) {
        Object.keys(rules).forEach((ruleId) => {
            const ruleConfig = rules[ruleId];

            if (typeof ruleConfig === 'number') {
                rules[ruleId] = RULE_SEVERITY_STRINGS[ruleConfig] || RULE_SEVERITY_STRINGS[0];
            } else if (Array.isArray(ruleConfig) && typeof ruleConfig[0] === 'number') {
                ruleConfig[0] = RULE_SEVERITY_STRINGS[ruleConfig[0]] || RULE_SEVERITY_STRINGS[0];
            }
        });
    }
}

/**
 * Determines if the severity for the given rule configuration represents an error.
 * @param {int|string|Array} ruleConfig The configuration for an individual rule.
 * @returns {boolean} True if the rule represents an error, false if not.
 */
function isErrorSeverity(ruleConfig: RuleConf) {
    return getRuleSeverity(ruleConfig) === 2;
}

/**
 * Checks whether a given config has valid severity or not.
 * @param {number|string|Array} ruleConfig The configuration for an individual rule.
 * @returns {boolean} `true` if the configuration has valid severity.
 */
function isValidSeverity(ruleConfig: RuleConf) {
    let severity: SeverityConf = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig;

    if (typeof severity === 'string') {
        severity = severity.toLowerCase() as SeverityConf;
    }
    return VALID_SEVERITIES.indexOf(severity) !== -1;
}

/**
 * Checks whether every rule of a given config has valid severity or not.
 * @param {Object} config The configuration for rules.
 * @returns {boolean} `true` if the configuration has valid severity.
 */
function isEverySeverityValid(config: Record<string, RuleConf>) {
    return Object.keys(config).every((ruleId) => isValidSeverity(config[ruleId]));
}

/**
 * Normalizes a value for a global in a config
 * @param {(boolean|string|null)} configuredValue The value given for a global in configuration or in
 * a global directive comment
 * @returns {("readonly"|"writeable"|"off")} The value normalized as a string
 * @throws Error if global value is invalid
 */
function normalizeConfigGlobal(configuredValue: boolean | string | null): 'readonly' | 'writable' | 'off' {
    switch (configuredValue) {
        case 'off':
            return 'off';

        case true:
        case 'true':
        case 'writeable':
        case 'writable':
            return 'writable';

        case null:
        case false:
        case 'false':
        case 'readable':
        case 'readonly':
            return 'readonly';

        default:
            throw new Error(
                `'${configuredValue}' is not a valid configuration for a global (use 'readonly', 'writable', or 'off')`
            );
    }
}

export {
    getRuleSeverity,
    normalizeToStrings,
    isErrorSeverity,
    isValidSeverity,
    isEverySeverityValid,
    normalizeConfigGlobal
};