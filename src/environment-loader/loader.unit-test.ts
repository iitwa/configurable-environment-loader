import fs from 'fs';
import path from 'path';
import { loadEnvironment, EnvironmentLoaderOptions, convertToNumeric, valueIsNumeric, valueIsString} from './loader';
import exp from 'constants';


// Function to read JSON file and parse it to an object
export function readJsonFile(fileName: string): any {
    try {
        const filePath = path.join(__dirname, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (err) {
        console.error('Error reading file:', err);
        return null;
    }
}

describe('Tests', () => {
    beforeEach(() => {
    });

    test('Required parameter not specified', async () => {

        let options: EnvironmentLoaderOptions = {
            logFunction: console.log,
            throwExceptionOnInvalid: false,
            expectedEnvironmentVariables: [
                {
                    variableName: "SuppliedValue",
                    expectedType: valueIsString,
                    isRequired: true,
                    messageWhenInvalid: "Supplied value SuppliedValue is not valid",
                    messageWhenMissing: "SuppliedValue parameter is not specified"
                },
                {
                    variableName: "UndefinedParm",
                    expectedType: valueIsString,
                    isRequired: true,
                    messageWhenInvalid: "Supplied value UndefinedParm is not valid",
                    messageWhenMissing: "UndefinedParm parameter is not specified"
                }
            ]

            , suppliedEnvironmentVariables: {
                "SuppliedValue": "SuppliedValue",
                "UndefinedParm": undefined
            }
        };
        let actualEnvironmentVariablesLoaded = loadEnvironment(options);
        let expectedEnvironmentVariables = {
            "environmentLoaderOptions": options,
            "environmentVariables": {
                "SuppliedValue": "SuppliedValue"
            },
            loadedSuccessfully: false,
            loadMessages: ["UndefinedParm parameter is not specified"]
        }

        expect(actualEnvironmentVariablesLoaded).toEqual(expectedEnvironmentVariables);



    });


    test('Required parameter specified but invalid', async () => {

        let options: EnvironmentLoaderOptions = {
            logFunction: console.log,
            throwExceptionOnInvalid: false,
            expectedEnvironmentVariables: [
                {
                    variableName: "InvalidString",
                    expectedType: valueIsString,
                    isRequired: true,
                    messageWhenInvalid: "InvalidString is not valid"
                },
                {
                    variableName: "InvalidNumber",
                    expectedType: valueIsNumeric,
                    isRequired: true,
                    messageWhenInvalid: "InvalidNumber is not valid"
                },
                {
                    variableName: "ValidNumber",
                    expectedType: valueIsNumeric,
                    isRequired: true,
                    messageWhenInvalid: "ValidNumber is not valid"
                },

            ]

            , suppliedEnvironmentVariables: {
                "InvalidString": "123",
                "InvalidNumber": "stringshouldbenumber",
                "ValidNumber": "123"
            }
        }
        let actualEnvironmentVariablesLoaded = loadEnvironment(options);
        let expectedEnvironmentVariables = {
            "environmentLoaderOptions": options,
            "environmentVariables": {
                "InvalidString": "123",
                "InvalidNumber": "stringshouldbenumber",
                "ValidNumber": "123"
            },
            loadedSuccessfully: false,
            loadMessages: ["InvalidNumber is not valid"]
        }

        expect(actualEnvironmentVariablesLoaded).toEqual(expectedEnvironmentVariables);
    })

    test('Invalid result throws exception if an occurs and is requested.', async () => {

        let options: EnvironmentLoaderOptions = {
            logFunction: console.log,
            throwExceptionOnInvalid: true,
            expectedEnvironmentVariables: [
                {
                    variableName: "InvalidNumber",
                    expectedType: valueIsNumeric,
                    isRequired: true,
                    messageWhenInvalid: "InvalidNumber is not valid"
                }

            ]

            , suppliedEnvironmentVariables: {
                "InvalidNumber": "stringshouldbenumber",
            }
        }


        let expectedExceptionText = "InvalidNumber is not valid";

        expect(() => loadEnvironment(options)).toThrow(expectedExceptionText);
        options.throwExceptionOnInvalid = false;
        expect(() => loadEnvironment(options)).not.toThrow(expectedExceptionText);
        options.suppliedEnvironmentVariables["InvalidNumber"] = "123";
        options.throwExceptionOnInvalid = true;
        expect(() => loadEnvironment(options)).not.toThrow(expectedExceptionText);

    })

    test('Default variable value used when not supplied', async () => {

        let options: EnvironmentLoaderOptions = {
            logFunction: console.log,
            throwExceptionOnInvalid: false,
            expectedEnvironmentVariables: [
                {
                    variableName: "OptionalValue",
                    expectedType: valueIsString,
                    isRequired: false,
                    defaultValue: "somedefaultvalue",
                    messageWhenInvalid: "InvalidString is not valid"
                },
                {
                    variableName: "OptionalValueWithoutDefault",
                    expectedType: valueIsString,
                    isRequired: false,
                    messageWhenMissing: "OptionalValueWithoutDefault is missing"
                },
                {
                    variableName: "OptionalValueWithoutDefaultNoMessage",
                    expectedType: valueIsString,
                    isRequired: false
                },
                {
                    variableName: "InvalidValueUsingDefaultMessage",
                    expectedType: valueIsNumeric,
                    isRequired: false,
                    defaultValue: "somedefaultvalue",
                }

            ]
            , suppliedEnvironmentVariables: { "InvalidValueUsingDefaultMessage": "asome" }
        }

        let actualEnvironmentVariablesLoaded = loadEnvironment(options);
        let expectedEnvironmentVariables = {
            "environmentLoaderOptions": options,
            "environmentVariables": {
                "InvalidValueUsingDefaultMessage": "asome",
                "OptionalValue": "somedefaultvalue",
            },
            loadedSuccessfully: false,
            loadMessages: ["Setting OptionalValue to default value somedefaultvalue", 
            "OptionalValueWithoutDefault is missing", 
            "Missing value for variable  OptionalValueWithoutDefaultNoMessage but no default value provided",
            "Variable InvalidValueUsingDefaultMessage has invalid value asome"]
        }

        expect(actualEnvironmentVariablesLoaded).toEqual(expectedEnvironmentVariables);
    })

    test('Convert valid value into number', async () => {

        let options: EnvironmentLoaderOptions = {
            logFunction: console.log,
            throwExceptionOnInvalid: false,
            expectedEnvironmentVariables: [
                {
                    variableName: "Count",
                    expectedType: valueIsNumeric,
                    conversionFunction: convertToNumeric,
                    isRequired: true,
                }
            ]
            , suppliedEnvironmentVariables: { "Count": "123" }
        }

        let actualEnvironmentVariablesLoaded = loadEnvironment(options);
        let expectedEnvironmentVariables = {
            "environmentLoaderOptions": options,
            "environmentVariables": {
                "Count": 123,
            },
            loadedSuccessfully: true,
            loadMessages: []
        }

        expect(actualEnvironmentVariablesLoaded).toEqual(expectedEnvironmentVariables);
    })
})
