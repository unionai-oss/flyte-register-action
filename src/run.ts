import * as core from '@actions/core';
import * as github from '@actions/github'
import * as io from '@actions/io';
import * as fs from 'fs';
import * as path from 'path';
import cp from 'child_process';
import { Error, isError } from './error';


const runnerTempEnvKey = 'RUNNER_TEMP'

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

    const version = core.getInput('version');
    if (version === '') {
        return {
            message: 'a version for register was not provided'
        };
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
    const flytesnacks = core.getInput('flytesnacks');
    if (flytesnacks === 'true') {
        command = "examples"
    }

    let protoPath = ""
    const proto = core.getInput('k8ServiceAccount');
    if (proto.length > 0 ) {
        protoPath = proto
    }

    let k8ServiceAccountFlag = ""
    const k8ServiceAccount = core.getInput('k8ServiceAccount');
    if (k8ServiceAccount === '') {
        k8ServiceAccountFlag = "--k8ServiceAccount "+ k8ServiceAccount
    }

    let outputLocationPrefixFlag = ""
    const outputLocationPrefix = core.getInput('outputLocationPrefix');
    if (outputLocationPrefix === '') {
        outputLocationPrefixFlag = "--outputLocationPrefix " + outputLocationPrefix
    }

    let sourceUploadPathFlag = ""
    let sourceUploadPath = core.getInput('sourceUploadPath');
    if (sourceUploadPath.length > 0) {
        sourceUploadPathFlag = "--sourceUploadPath " + sourceUploadPath
    }

    let archiveFlag = ""
    const archive = core.getInput('archive');
    if (archive === 'true') {
        archiveFlag = "--archive"
    }

    let dryRunFlag = ""
    let dryRun = core.getInput('dryRun');
    if (dryRun.length > 0) {
        dryRunFlag = "--dryRun"
    }

    let continueOnErrorFlag = ""
    const continueOnError = core.getInput('continueOnError');
    if (continueOnError === '') {
        continueOnErrorFlag = "--continueOnError"
    }

    const binaryPath = await io.which('flytectl', true);
    if (binaryPath === '') {
        return {
            message: 'flytectl is not installed; please add the "unionai/flytectl-setup-action" step to your job found at https://github.com/unionai/flytectl-setup-action'
        };
    }

    cp.execSync(
        `${binaryPath} register ${command} ${protoPath} ${archive} -p ${project} -d ${domain} ${dryRunFlag} ${sourceUploadPathFlag} ${continueOnErrorFlag} ${archiveFlag} ${outputLocationPrefixFlag} ${k8ServiceAccountFlag} ${configFlag}`
    );

    return null;
}