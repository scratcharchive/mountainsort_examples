function mv_closeall
mfilepath=fileparts(mfilename('fullpath'));
f=fopen([mfilepath,'/../../mountainview/bin/closeme.tmp'],'wb');
fwrite(f,0);   % since writing 0-length didn't touch file
if (f>=0) fclose(f); end;
end