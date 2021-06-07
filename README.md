# flyte-setup-action
Register [flyte](https://github.com/flyteorg/flyte) serialize workflow

## Usage

Refer to the [action.yml](https://github.com/unionai/flyte-register-action/blob/master/action.yml)
to see all of the action parameters.

```yaml
steps:
  - uses: actions/checkout@v2
  - name: Setup flytectl config
    run: |
      mkdir -p ~/.flyte
      cp config.yaml ~/.flyte/config.yaml
  - name: Setup flytesnacks
    run: |
      git clone https://github.com/flyteorg/flytesnacks
      cd flytesnacks
      make start
  - name: Setup flytectl
    uses: unionai/flytectl-setup-action@v0.0.1
    with:
      version: "0.1.8"
  - uses: unionai/flyte-register-action@v0.0.1
    with:
      version: '0.1.8' # The version of workflow
      proto: 'https://github.com/flyteorg/flytesnacks/releases/download/v0.2.89/flytesnacks-core.tgz'
      project: 'flytesnacks'
      domain: 'development'
      archive: true

```

