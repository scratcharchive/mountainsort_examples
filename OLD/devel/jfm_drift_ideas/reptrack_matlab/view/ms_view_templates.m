function ms_view_templates(templates,opts)
%MS_VIEW_TEMPLATES - View spike type templates or a sequence of event clips
%
% Syntax:  ms_view_templates(templates,opts)
%
% Inputs:
%    templates - MxTxK array of spike type templates or array of event
%    clips
%    opts.Tpad - the spacing between templates, (default floor(T*0.2))
%    opts.stdev - optional MxTxK array of standard deviations to be viewed
%    opts.showcenter - optional, if true plot fiducial lines at the "center" time
%    opts.pops - optional, if present interpreted as populations & blobs shown
%
% Other m-files required: none
%
% See also: mscmd_templates, ms_templates, ms_view_templates_from_clips

% Author: Jeremy Magland
% Jan 2015; Last revision: 22-Apr-2016, Barnett

if (nargin<1) test_ms_view_templates; return; end;

[M,T,K]=size(templates);

if (nargin<2) opts=struct; end;
if (~isfield(opts,'Tpad')) opts.Tpad=floor(T*0.2); end;
if ~isfield(opts,'showcenter'), opts.showcenter = 0; end
if ~isfield(opts,'show_cluster_labels'), opts.show_cluster_labels=1; end;
if ~isfield(opts,'show_channel_labels'), opts.show_channel_labels=1; end;
if ~isfield(opts,'line_width'), opts.line_width=1; end;

Tpad=opts.Tpad;

vspread=max(max(abs(templates(:))), 1e-15);  % prevent hitting zero

colors={...
    [0.1562,0.1562,0.1562],... %"#282828"
    [0.2500,0.1250,0.1250],... %"#402020"
    [0.1250,0.2500,0.1250],... %"#204020"
    [0.1250,0.1250,0.4375],... %"#202070"
};

if opts.showcenter   % fiduciary lines (plot behind everything else)
  Tcen = floor((T+1)/2);   % center time in samples
  for k=1:K
    plot(Tcen*[1 1]+(k-1)*(T+Tpad), vspread*[-M+.5 .5],'-','color',.9*[1 1 1]);
    hold on;
  end
end

if isfield(opts,'stdev')
    for sgn=-1:2:1
        y_offset=0;
        for m=1:M
            tmp=cat(2,templates(m,:,:)+sgn*opts.stdev(m,:,:),ones(1,Tpad,K)*inf);
            tmp=reshape(tmp,1,(T+Tpad)*K);
            hh=plot(tmp+y_offset); hold on;
            set(hh,'Color',[0.7,0.7,0.7]);
            set(hh,'LineStyle','--');
            y_offset=y_offset-vspread;
        end;
    end;
end;

y_offset=0;
for m=1:M
    tmp=cat(2,templates(m,:,:),ones(1,Tpad,K)*inf);
    tmp=reshape(tmp,1,(T+Tpad)*K);
    tmp(find(tmp==0))=inf;
    hh=plot(tmp+y_offset); hold on;
    set(hh,'LineWidth',opts.line_width);
    set(hh,'Color',colors{1+mod(m-1,length(colors))});
    y_offset=y_offset-vspread;
end;

vspread=double(vspread); %fix error in text below

Tmargin=T+Tpad;
vmargin=vspread*1.5;
additional_left_margin=T*0.5;
xlim([-Tmargin-additional_left_margin,(T+Tpad)*K+Tmargin]);
ylim([-vspread*(M-1)-vmargin,vmargin]);
set(gca,'xtick',[]); set(gca,'ytick',[]);
%set(gca,'position',[0,0,1,1]);

if isfield(opts,'pops')
  popsc = 50/sqrt(max(opts.pops));  % blob size scale (propto area)
  for k=1:K
    if opts.pops(k)>0
      plot((T+Tpad)*(k-1)+T/2,-vspread*(M-1)-1.0*vspread,'k.','markersize',max(1,popsc*sqrt(opts.pops(k)))); hold on;
    end
  end
end

label_color=[0.7,0.7,0.7];  % now do text number labels...

if (opts.show_cluster_labels)
    for k=1:K
      hh=text((T+Tpad)*(k-1)+T/2,vspread/2,sprintf('%d',k));
      set(hh,'HorizontalAlignment','center');
      set(hh,'VerticalAlignment','bottom');
      set(hh,'FontSize',10);
      set(hh,'Color',label_color);
    end;

    if ~isfield(opts,'pops')   % ahb
      for k=1:K
        hh=text((T+Tpad)*(k-1)+T/2,-vspread*(M-1)-vspread/2,sprintf('%d',k));
        set(hh,'HorizontalAlignment','center');
        set(hh,'VerticalAlignment','top');
        set(hh,'FontSize',10);
        set(hh,'Color',label_color);
      end;
    end
end;

if (opts.show_channel_labels)
    for m=1:M
        hh=text(-Tpad,-(m-1)*vspread,sprintf('Chan %d',m));
        set(hh,'HorizontalAlignment','right');
        set(hh,'VerticalAlignment','middle');
        set(hh,'FontSize',8);
        set(hh,'Color',label_color);
    end;
end;

end

function test_ms_view_templates

mfile_path=fileparts(mfilename('fullpath'));
%templates=readmda(sprintf('%s/../example_data/templates0.mda',mfile_path));
templates=randn(6,120,10);

opts.stdev=templates*0.2;

figure;
ms_view_templates(templates,opts);

end

