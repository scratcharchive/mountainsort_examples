fname='download/NETO/2014_11_25_Pair_3_0/amplifier2014-11-25T23_00_08.bin';
F=fopen(fname);
X=fread(F,[32,inf],'uint16');
fclose(F);

figure;
for j=1:32
    plot(X(j,1:300));
    hold on;
end

fname='datasets/neto_32ch_1/raw.mda';

Y=readmda(fname);

figure;
for j=1:32
    plot(Y(j,1:300));
    hold on;
end


