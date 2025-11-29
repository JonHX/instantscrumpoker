# Why `sam build` is Needed

## What `sam build` Does

`sam build` is **required** - it's part of the AWS SAM CLI workflow that:

1. **Processes the SAM template** (`template.yaml`)
   - Validates the template syntax
   - Resolves all `CodeUri` references
   - Prepares CloudFormation parameters

2. **Packages Lambda code**
   - Takes the code from `CodeUri: ./lambda-build/`
   - Bundles it for Lambda deployment
   - Creates deployment artifacts in `.aws-sam/` directory

3. **Prepares for deployment**
   - Generates the final CloudFormation template
   - Packages everything for `sam deploy`

## Our Build Process

1. **`build-sam.sh`** (our script):
   - Compiles TypeScript → JavaScript
   - Installs production dependencies
   - Creates `lambda-build/` directory with compiled code

2. **`sam build`** (AWS SAM CLI):
   - Reads `template.yaml`
   - Finds `CodeUri: ./lambda-build/`
   - Packages it for CloudFormation deployment
   - Creates `.aws-sam/build/` with deployment-ready artifacts

3. **`sam deploy`**:
   - Uploads to S3 (or uses `--resolve-s3`)
   - Creates/updates CloudFormation stack
   - Deploys Lambda functions

## Why Both?

- **build-sam.sh**: Handles TypeScript compilation and dependency management (project-specific)
- **sam build**: Handles SAM template processing and CloudFormation packaging (AWS-specific)

You **cannot skip `sam build`** - it's required by `sam deploy`.

