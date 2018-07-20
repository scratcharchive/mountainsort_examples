function ms_view_clusters(features,labels)
%MS_VIEW_CLUSTERS - 2D or 3D view of clusters in feature space, colored by
%labels
%
% Syntax:  ms_view_clusters(features,labels)
%
% Inputs:
%    features - RxL array of features (R>=2), e.g., optained by
%               mscmd_features or ms_event_features
%    labels - 1xL array of integer labels (controls the colors of the data
%    points)
%
% Other m-files required: distinguishable_colors, legnum, num2cellstr
%
% See also: mscmd_features, ms_event_features

% Author: Jeremy Magland
% Jan 2015; Last revision: 26-Feb-2016. AHB broke legnum/num2cellstr out,
% replaced plot3 w/ scatter3, does correct z-buffering.

if nargin<1, test_ms_view_clusters; return; end;
ptsiz = 20;    % for 3d points

addpath([fileparts(mfilename('fullpath')),'/colorspace']);

M=size(features,1); if (M>3) features=features(1:3,:); end; M=size(features,1);
N=size(features,2);

if nargin<2
    labels=ones(1,N);
end;

K=max(labels);

CC=distinguishable_colors(K,{'w'});
colors={};
for j=1:size(CC,1)
	colors{j}=CC(j,:);
end;

if M==2
    legend_titles={};
    for k=0:K
        inds=find(labels==k);
        if (length(inds)>0)
            if (k>0)
                plot(features(1,inds),features(2,inds),'.','Color',colors{k}); hold on;
            else
                plot(features(1,inds),features(2,inds),'.','Color',[0.5,0.5,0.5]); hold on;
            end;
            legend_titles{end+1}=sprintf('%d',k);
        end;
    end;
    legend(legend_titles);
    hold off;
    %legnum(1:K);
    axis equal; xlabel('z_1'); ylabel('z_2');
  
elseif M==3
  for k=0:K
    inds=find(labels==k);
    if (length(inds)>0)
      if (k>0)
        scatter3(features(1,inds),features(2,inds),features(3,inds),ptsiz*ones(size(inds)),ones(numel(inds),1)*colors{k},'.'); hold on;
      else
        scatter3(features(1,inds),features(2,inds),features(3,inds),ptsiz*ones(size(inds)),0.5*ones(numel(inds),3),'+'); hold on;
      end;
    end;
  end
  hold off;
  grid off
  % call legend with 2 or more output arguments to fix bug in R2015b
  % see: http://www.mathworks.com/support/bugreports/1283854
  hh=findobj(gca,'type','Scatter');
  %%% Oh boy, why do we need to reverse this?
  hh=hh(end:-1:1);
  [~,~] = legend(hh,num2cellstr(1:K));
  xlabel('z_1'); ylabel('z_2'); zlabel('z_3');
  axis equal vis3d;       % for good aspect ratio and rotation
else
    error('Invalid number of dimensions: %d',M);
end
hline(0); vline(0);   % ahb plot improvements


end

function test_ms_view_clusters
X=cat(2,randn(2,200),3+randn(2,200));
labels=cat(2,ones(1,200),ones(1,200)*2);
figure;
ms_view_clusters(X,labels);
end
