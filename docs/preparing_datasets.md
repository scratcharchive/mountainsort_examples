## Preparing datasets

To use MountainSort with your own data, you should prepare datasets in the following directory structure:

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

`raw.mda` is the `M x N` timeseries array in [mda format](mda_format.md), where `M` is the number of channels and `N` is the number of timepoints.

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
