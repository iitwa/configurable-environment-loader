export type ValidationFunctionType = (param: any) => boolean;

export type ConversionFunctionType = (param: any) => any;

export type EnvironmentVariable = {
    variableName: string;
    isRequired: boolean;
    description?: string;
    messageWhenMissing?: string;
    messageWhenInvalid?: string;
    expectedType: ValidationFunctionType;
    conversionFunction?: ConversionFunctionType;
    defaultValue?: string;
    actualValue?: any;
};

export type LogFunctionType = (...args: any[]) => void;

export interface ProcessEnvType {
    [key: string]: string | undefined;
}

export interface EnvironmentVariablesConverted {
    [key: string]: any;
}

export type EnvironmentLoaderOptions = {
    throwExceptionOnInvalid?: boolean;
    logFunction?: LogFunctionType;
    expectedEnvironmentVariables: EnvironmentVariables;
    suppliedEnvironmentVariables: ProcessEnvType;
}

export function valueIsNumeric(value: any): boolean {
    let result: boolean = false;
    if (hasValue(value)) {
        result = !isNaN(parseFloat(value)) && isFinite(value);
    }
    return result;
}

export function convertToNumeric(value: any): number {
    return parseFloat(value);
}

export function valueIsString(value: any): boolean {
    return hasValue(value) && typeof value === 'string'
}


export function hasValue(value: any) {
    return value != null && value != undefined
}

export type EnvironmentVariables = EnvironmentVariable[];

export type EnvironmentVariablesLoaded = {
    environmentLoaderOptions: EnvironmentLoaderOptions;
    environmentVariables: EnvironmentVariablesConverted;
    loadedSuccessfully: boolean;
    loadMessages: string[];
}

export function loadEnvironment(environmentLoaderOptions: EnvironmentLoaderOptions): EnvironmentVariablesLoaded {
    const result: EnvironmentVariablesLoaded = {
        environmentLoaderOptions: environmentLoaderOptions,
        environmentVariables: {},
        loadedSuccessfully: true,
        loadMessages: []
        
    };

    let logFunction: LogFunctionType = environmentLoaderOptions.logFunction as LogFunctionType;
    if (logFunction == undefined || logFunction == null) {
        logFunction = console.log;
    }

    let suppliedEnvironmentVariables = environmentLoaderOptions.suppliedEnvironmentVariables;
    if (!hasValue(suppliedEnvironmentVariables)) {
        suppliedEnvironmentVariables = process.env;
    }

    environmentLoaderOptions.expectedEnvironmentVariables.forEach(varDef => {
        const value = suppliedEnvironmentVariables[varDef.variableName];
        const isValid = varDef.expectedType(value);
        const conversionFunction: ConversionFunctionType = varDef.conversionFunction as ConversionFunctionType;

        if (!hasValue(value)) {
            if (varDef.isRequired) {
                result.loadedSuccessfully = false;
                if (hasValue(varDef.messageWhenMissing)) {
                    let message: string = varDef.messageWhenMissing as string;
                    result.loadMessages.push(message);
                    if (hasValue(logFunction)) {
                        logFunction(message);
                    }
                }
                varDef.actualValue = null;
            } else {
                if(!result.loadedSuccessfully) {
                    result.loadedSuccessfully = true;
                }
                if (hasValue(varDef.defaultValue)) {
                    varDef.actualValue = varDef.defaultValue;
                    result.loadMessages.push("Setting " + varDef.variableName + " to default value " + varDef.defaultValue);
                    if (hasValue(varDef.conversionFunction)) {
                        result.environmentVariables[varDef.variableName] = conversionFunction(varDef.defaultValue);
                    } else {
                        result.environmentVariables[varDef.variableName] = varDef.defaultValue;
                    }

                } else if (hasValue(varDef.messageWhenMissing)) {
                    result.loadMessages.push(varDef.messageWhenMissing as string);
                } else {
                    result.loadMessages.push("Missing value for variable  " + varDef.variableName + " but no default value provided");
                    if(!result.loadedSuccessfully) {
                        result.loadedSuccessfully = true;
                    }
                }
            }
        } else if (!isValid) {
            result.loadedSuccessfully = false;
            result.environmentVariables[varDef.variableName] = value;
            if (hasValue(logFunction)) {
                if (hasValue(varDef.messageWhenInvalid)) {
                    const message: string = varDef.messageWhenInvalid as string;
                    logFunction(message);
                    result.loadMessages.push(message);
                } else {
                    const message: string = "Variable " + varDef.variableName + " has invalid value " + value;
                    logFunction(message);
                    result.loadMessages.push(message);
                }
            }
        } else {
            if (hasValue(varDef.conversionFunction)) {
                result.environmentVariables[varDef.variableName] = conversionFunction(value);
            } else {
                result.environmentVariables[varDef.variableName] = value;
            }
        }
    });

    if (!result.loadedSuccessfully && environmentLoaderOptions.throwExceptionOnInvalid) {
        throw new Error(result.loadMessages.join(' '));
    }

    return result;

}

