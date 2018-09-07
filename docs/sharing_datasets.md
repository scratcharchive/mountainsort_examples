## Sharing datasets

MountainLab makes it possible to share electrophysiology datasets by hosting them from your own computer, enabling you to take advantage of the web-based sorting capabilities. This is helpful for troubleshooting spike sorting issues, comparing methods, and collaborating on algorithm development.

### Step 1: prepare your datasets

First you will need to organize your data into MountainSort-compatible datasets. Your directory structure should be as follows:

```
study_directory/
  dataset1/
    raw.mda
    geom.csv
    params.json
  dataset2/
    ...
```

where `study_directory`, `dataset1`, `dataset2`, ... can be replaced by names of your choosing (don't use spaces in the file names).

`raw.mda` is the `M x N` timeseries array in [mda format][**link needed**], where `M` is the number of channels and `N` is the number of timepoints.

`geom.csv` represents the probe geometry and is a comma-separated text file containing 2-d or 3-d coordinates of the electrodes. The number of lines (or rows) in `geom.csv` should equal `M`, the number of channels. For example:

```
0,0
20,0
0,20
20,20
```

`params.json` is a JSON format file containing dataset-specific parameters, including `samplerate` (in Hz) and `spike_sign` (`-1`, `0`, or `1`). For example:

```
{
  "samplerate":30000,
  "spike_sign":-1
}
```

### Step 2: Install KBucket

KBucket is a system for sharing data to the internet from your computer, even when you are behind a firewall. Rather than uploading your data to a server, you host the data on your own machine. The easiest way to install kbucket is using conda, but [alternate installation methods](https://github.com/flatironinstitute/kbucket) are also available. After entering a new conda environment, run the following:

```
conda install -c flatiron -c conda-forge kbucket
```

### Step 3 (recommended): Start a tmux session

Since you will be hosting (rather than uploading) your data, the kbucket process needs to remain running -- if you close the terminal the data will no longer be on the network. It is recommended that you install tmux and start a new session

```
tmux new -s kbucket1
```

If you close the terminal or exit out of this session, it runs in the background, and then you can re-attach later using

```
tmux a -t kbucket1
```

For more information about tmux, do a google search.


### Step 4: Host the data on the KBucket network

Finally, make your data available to the kbucket network by running the following within your tmux session:

```
cd study_directory
kbucket-host .
```

The program will ask you several questions. You can accept the defaults, except:

* You must type "yes" to agree to share the resources, and confirm that you are sharing them for scientific research purposes (e.g., no sharing music or videos that don't relate to science experiments!)
* You should enter a description, your name, and your email
* For the parent hub passcode, you will need to ask Jeremy to give you that information.

If all goes well, hosting will succeed, indexing will begin, and your data will be available on the kbucket network!

Make note of the node id reported by the program (also found in the `.kbucket/kbnode.json` file within the shared directory). This is a crucial 12-character ID that uniquely identifies your kbucket share. If you stop the hosting and restart, your 12-character ID will stay the same. Let's say your ID was `aaabbbcccddd`. Then you should be able to browse your data at [https://kbucketgui.herokuapp.com/?node_id=aaabbbcccddd](https://kbucketgui.herokuapp.com/?node_id=aaabbbcccddd).

To stop hosting just kill the process via `ctrl+c` within the terminal. If you are in a tmux session, then you can safely close the terminal and the hosting will continue, unless of course you turn off your computer!

Now, you can refer to your dataset (for example `dataset1`) in processing pipelines via the kbucket url:

```
kbucket://[your-id]/dataset1
```

### More information

For more information, visit the [kbucket page](https://github.com/flatironinstitute/kbucket).