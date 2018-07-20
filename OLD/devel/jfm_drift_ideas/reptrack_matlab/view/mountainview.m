function mountainview(view_params)
%MOUNTAINVIEW - Launch the MountainView viewer (needs to be compiled)
%
%The MountainView program allows interactive visualization of the results
%of a spike sorting run.
%
% Syntax:  mountainview(view_params)
%
% Inputs:
%    (Most are optional)
%    view_params.mode - 'overview2' (default)
%    view_params.raw - MxN raw data (array or path to .mda)
%    view_params.filt - MxN filtered data (array or path to .mda)
%    view_params.pre - MxN preprocessed data (array or path to .mda)
%    view_params.timeseries - MxN filtered data (array or path to .mda)
%    view_params.firings - RxL array of times/labels etc. according to
%                           the docs. R is at least 3. The second row is 
%                           the times, the third row is the labels. (array
%                           or path to .mda)
%    view_params.samplerate - sampling frequency (Hz)
%    view_params.locations - (not used yet) path to Mx2 array of 2D
%                            coordinates of electrode
%                            layout (visualization only)
%
% Other m-files required: none
%
% See also:

% Author: Jeremy Magland
% Jan 2016; Last revision: 17-Mar-2016 (St. Patrick's Day)

mfile_path=fileparts(mfilename('fullpath'));
exe_fname=mountainview_exe;

cmd='';
cmd=[cmd,sprintf('%s ',exe_fname)];

if ~isfield(view_params,'mode') view_params.mode='overview2'; end;

if isfield(view_params,'mode')
    cmd=[cmd,sprintf('--mode=%s ',view_params.mode)];
end;
if isfield(view_params,'raw')
    view_params.raw=create_temporary_path_if_array32(view_params.raw);
    cmd=[cmd,sprintf('--raw=%s ',view_params.raw)];
end;
if isfield(view_params,'filt')
    view_params.filt=create_temporary_path_if_array32(view_params.filt);
    cmd=[cmd,sprintf('--filt=%s ',view_params.filt)];
end;
if isfield(view_params,'pre')
    view_params.pre=create_temporary_path_if_array32(view_params.pre);
    cmd=[cmd,sprintf('--pre=%s ',view_params.pre)];
end;
if isfield(view_params,'timeseries')
    view_params.timeseries=create_temporary_path_if_array32(view_params.timeseries);
    cmd=[cmd,sprintf('--timeseries=%s ',view_params.timeseries)];
end;
if isfield(view_params,'firings')
    view_params.firings=create_temporary_path_if_array64(view_params.firings);
    cmd=[cmd,sprintf('--firings=%s ',view_params.firings)];
end;
if isfield(view_params,'samplerate')
    cmd=[cmd,sprintf('--samplerate=%f ',view_params.samplerate)];
end;
if isfield(view_params,'locations')
    %Not yet used
    view_params.locations=create_temporary_path_if_array32(view_params.locations);
    cmd=[cmd,sprintf('--locations=%s ',view_params.locations)];
end;

ld_library_str='LD_LIBRARY_PATH=/usr/local/lib';

fprintf('%s\n',cmd);
system(sprintf('%s %s &',ld_library_str,cmd));

end

function path=create_temporary_path_if_array32(X)
if (isstr(X)) path=X; return; end;
path=create_temporary_mda_path;
writemda32(X,path);
end

function path=create_temporary_path_if_array64(X)
if (isstr(X)) path=X; return; end;
path=create_temporary_mda_path;
writemda64(X,path);
end

function path=create_temporary_mda_path
path=[tempdir,'/mountainsort'];
if ~exist(path)
    mkdir(path);
end;
path=sprintf('%s/mountainview_tmp_%d_%d.mda',path,randi(1e7),randi(1e7));
end
