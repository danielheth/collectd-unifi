# collectd-unifi
> CollectD script for pulling statistical data from unifi network equipment

## Install

``` sh
npm install -g collectd-unifi
```

## Configure CollectD
- Assuming you've copied this repo into /opt/collectd-unifi and have already run `npm install` to pull down dependencies.

```
LoadPlugin exec
<Plugin exec>
        Exec "nobody" "node /opt/collectd-unifi/collectd-unifi.js" "--unifi" "[ip of controller]" "[port of controller]" "[username]" "[password]"
</Plugin>
```

### Helpful Other Configurations...
I'm using this script as part of a collectd-influxdb-grafana integration to display the most vital parts of my Ubiquiti Unifi network
on a large television I have in my office.  While developing this project, I learned certain things were required.
Background:  I have collectd, influxdb, and grafana running on a simple Intel NUC running Ubuntu 16.10 connected directly to the
television display.  The Unifi controller is running on another machine which the NUC has network access to.

#### CollectD
`rrd` is a required plugin for data to be pushed over to InfluxDB.  Here is the configuration I have within collectd for this integration:
```
LoadPlugin rrdtool
<Plugin rrdtool>
        DataDir "/var/lib/collectd/rrd"
</Plugin>
```

`influxdb` requires a bit of config also in order for collectd to push data...
```
LoadPlugin network
<Plugin network>
        Server "127.0.0.1" "25826"
        MaxPacketSize 1452
        Forward true
</Plugin>
```

#### InfluxDB
Configuring InfluxDB was also relatively easy... and OOB with minor changes.
```
[[collectd]]
  enabled = true
  bind-address = ":25826" # the bind address
  database = "collectd" # Name of the database that will be written to
  retention-policy = ""
  batch-size = 5000 # will flush if this many points gets buffered
  batch-pending = 10 # number of batches that may be pending in memory
  batch-timeout = "10s"
  read-buffer = 0 # UDP read buffer size, 0 means to use OS default
  typesdb = "/usr/share/collectd/types.db"
```


## References
- https://collectd.org/documentation/manpages/collectd-exec.5.shtml
