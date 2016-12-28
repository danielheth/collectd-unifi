# collectd-unifi
[![CircleCI](https://circleci.com/gh/danielheth/collectd-unifi.svg?style=svg)](https://circleci.com/gh/danielheth/collectd-unifi) [![Coverage Status](https://coveralls.io/repos/github/danielheth/collectd-unifi/badge.svg)](https://coveralls.io/github/danielheth/collectd-unifi)

> CollectD script for pulling statistical data from unifi network equipment

## Install

Currently, the module is written on Node 6, without any transpilers, using the
ES2015+ features.

``` sh
npm install -g collectd-unifi
```

## Configure CollectD
```TypesDb "/home/daniel/collectd-unifi/types.db"
LoadPlugin exec
<Plugin exec>
        Exec "daniel" "node /home/daniel/collectd-unifi/collectd-unifi.js" "--unifi" "[ip of controller]" "[port of controller]" "[username]" "[password]"
</Plugin>
```


## References
- https://collectd.org/documentation/manpages/collectd-exec.5.shtml
