function spikeview(view_params)
%MOUNTAINVIEW - Launch the MountainView viewer (needs to be compiled)
%
%The MountainView program allows interactive visualization of the results
%of a spike sorting run.
%
% Syntax:  mountainview(view_params)
%
% Inputs:
%    (Most are optional)
%    view_params.raw - MxN raw data (array or path to .mda)
%    view_params.timeseries - synonym for raw
%    view_params.firings - RxL array of times/labels etc. according to
%                           the docs. R is at least 3. The second row is 
%                           the times, the third row is the labels. (array
%                           or path to .mda)
%    view_params.samplerate - sampling frequency (Hz)
%    view_params.geom -      path to Mx2 array of 2D
%                            coordinates of electrode
%                            layout
%

% Author: Jeremy Magland
% Jan 2016; Last revision: August 2017

ld_library_str='LD_LIBRARY_PATH=/usr/local/lib';
args='';
keys=fieldnames(view_params);
for j=1:length(keys)
    args=sprintf('%s--%s=%s ',args,keys{j},num2str(view_params.(keys{j})));
end;
cmd=sprintf('%s spikeview %s &',ld_library_str,args);
fprintf('%s\n',cmd);
system(cmd);
