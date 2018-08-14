function prepare_neto

dir_in='download/NETO/2014_11_25_Pair_3_0';
dir_out='datasets/neto_32ch_1';
if ~exist(dir_out)
    mkdir(dir_out)
end;

fid=fopen([dir_in,'/adc2014-11-25T23_00_08.bin']);        % ADC = juxta
J = fread(fid,'uint16');
fclose(fid);
MJ = 8;   % # adc ch
N = numel(J)/MJ
J = reshape(J,[MJ N]);
used_channel = 0; J = J(used_channel+1,:);  % to 1-indexed channel #
J = J * (10/65536/100) * 1e6;     % uV
writemda32(J,[dir_out,'/juxta.mda']);
mJ = mean(J);
times = find(diff(J>mJ+(max(J)-mJ)/2)==1);  % trigger on half-way-up-going
labels = 1+0*times;
writemda64([0*times;times;labels],[dir_out,'/firings_true.mda']);

% elec coords (x,y)
M=32
ord = [31 24 7 1 21 10 30 25 6 15 20 11 16 26 5 14 19 12 17 27 4 8 18 13 23 28 3 9 29 2 22]; % ordering across, pasted from PDF file Map_32electrodes.pdf, apart from the top 0.
ord = ord+1;   % 1-indexed
x=nan(32,1); y=x;
x(1) = 0; x(ord(1:3:end))=0;
x(ord(2:3:end))=-sqrt(3)/2; x(ord(3:3:end))=+sqrt(3)/2;
y(1) = 0; y(ord(1:3:end))=-1:-1:-11;
y(ord(2:3:end))=-1.5:-1:-10.5; y(ord(3:3:end))=-1.5:-1:-10.5;
%figure; plot(x,y,'k.'); hold on; title('1-indexed electrode locations');
%for m=1:M, text(x(m),y(m),sprintf('%d',m)); end, axis equal

geom=zeros(2,M);
geom(1,:)=x;
geom(2,:)=y;
csvwrite([dir_out,'/geom.csv'],geom');