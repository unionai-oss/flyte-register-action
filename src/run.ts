import * as core from '@actions/core';
import * as io from '@actions/io';
import cp from 'child_process';
import { Error, isError } from './error';

export async function run(): Promise<void> {
    try {
        const result = await runPush();
        if (result !== null && isError(result)) {
            core.setFailed(result.message);
        }
    } catch (error) {
        if (isError(error)) {
            core.setFailed(error.message);
            return;
        }
        core.setFailed('Internal error');
    }
}


async function runPush(): Promise<null|Error> {

    let command = "files"

    let configFlag = ""
    const config = core.getInput('config');
    if (config.length > 0) {
        configFlag = "--config " + config
    }


    const project = core.getInput('project');
    if (project === '') {
        return {
            message: 'a project name was not provided'
        };
    }
    
    const domain = core.getInput('domain');
    if (domain === '') {
        return {
            message: 'a domain name was not provided'
        };
    }

    let protoPath = ""
    const proto = core.getInput('proto');
    if (proto.length > 0 ) {
        protoPath = proto
    }

    let archiveFlag = ""
    const archive = core.getInput('archive');
    if (archive === 'true') {
        archiveFlag = "--archive"
    }

    let versionFlag = ""
    let version = core.getInput('version');
    if (version === '') {
        return {
            message: 'a version for register was not provided'
        };
    }
    versionFlag = "--version "+ version

    const flytesnacks = core.getInput('flytesnacks');
    if (flytesnacks === 'true') {
        command = "examples"
        // If user define the flytesnacks then it will override the protoPath path
        protoPath = ""
        archiveFlag = ""
        if (version === 'latest'){
            // In this case no need to pass version flytectl will use latest release
            versionFlag = ""
        }
    }

    let k8ServiceAccountFlag = ""
    const k8ServiceAccount = core.getInput('k8ServiceAccount');
    if (k8ServiceAccount.length > 0) {
        k8ServiceAccountFlag = "--k8ServiceAccount "+ k8ServiceAccount
    }

    let outputLocationPrefixFlag = ""
    const outputLocationPrefix = core.getInput('outputLocationPrefix');
    if (outputLocationPrefix.length > 0) {
        outputLocationPrefixFlag = "--outputLocationPrefix " + outputLocationPrefix
    }

    let sourceUploadPathFlag = ""
    let sourceUploadPath = core.getInput('sourceUploadPath');
    if (sourceUploadPath.length > 0) {
        sourceUploadPathFlag = "--sourceUploadPath " + sourceUploadPath
    }

    let dryRunFlag = ""
    let dryRun = core.getInput('dryRun');
    if (dryRun.length > 0) {
        dryRunFlag = "--dryRun"
    }

    let continueOnErrorFlag = "--continueOnError"
    const continueOnError = core.getInput('continueOnError');
    if (continueOnError === '') {
        continueOnErrorFlag = ""
    }

    const binaryPath = await io.which('flytectl', true);
    if (binaryPath === '') {
        return {
            message: 'flytectl is not installed; please add the "unionai-oss/flytectl-setup-action" step to your job found at https://github.com/unionai-oss/flytectl-setup-action'
        };
    }
    const flytectlCommand = `${binaryPath} register ${command} ${protoPath}  -p ${project} -d ${domain} ${dryRunFlag} ${sourceUploadPathFlag} ${continueOnErrorFlag} ${archiveFlag} ${outputLocationPrefixFlag} ${k8ServiceAccountFlag} ${configFlag} ${versionFlag}`
    core.info(`flytectl command:  ${flytectlCommand}`);
    try {
        const o = cp.execSync(flytectlCommand, { encoding: "utf-8" });
        core.info(o);
    } catch(e) {
        return {
            message: e
        };
    }
    return null;
}
