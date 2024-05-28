# Environment Loader

A utility to load environment configurations easily. This package helps you load and validate environment variables with ease, providing mechanisms to handle default values, type checking, and error reporting.

## Installation

You can install the `environment-loader` package via npm:

npm install environment-loader

## Usage
Importing the Module

First, import the necessary functions and types from the environment-loader package:

```typescript

import { loadEnvironment, EnvironmentLoaderOptions, convertToNumeric, valueIsNumeric, valueIsString } from 'environment-loader';
```

## Defining Environment Variables

Define the environment variables you expect using the EnvironmentLoaderOptions type. You can specify the variable name, expected type, whether it is required, default values, and custom messages for validation errors.

## Example Usage

Here’s an example of how to use the environment-loader package to load and validate environment variables:

```typescript

import { loadEnvironment, EnvironmentLoaderOptions, convertToNumeric, valueIsNumeric, valueIsString } from 'environment-loader';

// Define the options for loading environment variables
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
            variableName: "Count",
            expectedType: valueIsNumeric,
            conversionFunction: convertToNumeric,
            isRequired: true,
        }
    ],
    suppliedEnvironmentVariables: {
        "SuppliedValue": process.env.SUPPLIED_VALUE,
        "Count": process.env.COUNT
    }
};

// Load and validate the environment variables
let actualEnvironmentVariablesLoaded = loadEnvironment(options);

console.log(actualEnvironmentVariablesLoaded);
```

## Handling Errors

You can configure the loader to throw exceptions on invalid values by setting throwExceptionOnInvalid to true. Otherwise, it will log the errors and continue.

```typescript

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
    ],
    suppliedEnvironmentVariables: {
        "InvalidNumber": "stringshouldbenumber"
    }
};

try {
    loadEnvironment(options);
} catch (error) {
    console.error(error);
}
```

## Providing Default Values

You can specify default values for optional environment variables:

```typescript

let options: EnvironmentLoaderOptions = {
    logFunction: console.log,
    throwExceptionOnInvalid: false,
    expectedEnvironmentVariables: [
        {
            variableName: "OptionalValue",
            expectedType: valueIsString,
            isRequired: false,
            defaultValue: "defaultvalue",
            messageWhenInvalid: "OptionalValue is not valid"
        }
    ],
    suppliedEnvironmentVariables: {}
};

let actualEnvironmentVariablesLoaded = loadEnvironment(options);
console.log(actualEnvironmentVariablesLoaded);
```

## Conversion Functions

You can specify conversion functions to convert the values to the desired type after validation:

```typescript

let options: EnvironmentLoaderOptions = {
    logFunction: console.log,
    throwExceptionOnInvalid: false,
    expectedEnvironmentVariables: [
        {
            variableName: "Count",
            expectedType: valueIsNumeric,
            conversionFunction: convertToNumeric,
            isRequired: true
        }
    ],
    suppliedEnvironmentVariables: { "Count": "123" }
};

let actualEnvironmentVariablesLoaded = loadEnvironment(options);
console.log(actualEnvironmentVariablesLoaded);
```

# Building the source
Clone the repository, install the necessary build packages. 

## Clone the repository
```bash
git clone https://github.com/iitwa/environment-loader
```

## Install NodeJS 
This was built using NodeJS v18. This can be found at [https://nodejs.org] (https://nodejs.org). Install NodeJS and make 
the node programs path accsesible.

## Install development packages
From the cloned directory, install the packages using the npm command as follows:
``` bash
npm install --save-dev .
```

From here, development activities can be driven by the Gulp file using commands to compile, test and package them.

These gulp targets are as follows:
| Task             | Purpose                              |
|-----------------:|-------------------------------------:|
| compile          | Does Typescript transpilation.       |
| test             | Executes unit tests on compiled code |
| npm              | Gathers files into one place so that |
|                  | NPM packaging can be done


