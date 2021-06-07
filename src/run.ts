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
    const config = core.getInput('config');
    if (config === '') {
        return {
            message: 'a flytectl config was not provided'
        };
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
    const proto = core.getInput('proto');
    if (proto === '') {
        return {
            message: 'a serialze proto url was not provided. like https://github.com/flyteorg/flytesnacks/releases/download/v0.2.89/flytesnacks-core.tgz'
        };
    }

    const binaryPath = await io.which('flytectl', true);
    if (binaryPath === '') {
        return {
            message: 'flytectl is not installed; please add the "unionai/flytectl-setup-action" step to your job found at https://github.com/unionai/flytectl-setup-action'
        };
    }

    cp.execSync(
        `${binaryPath} register file  ${proto} --archive -p ${project} -d ${domain}`
    );

    return null;
}