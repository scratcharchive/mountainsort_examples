function showpowerspectrum(Y,samplerate,smoothwid,linetype)
% SHOWPOWERSPECTRUM  plots power spectrum of 1d signal with correct freq axes
%
% showpowerspectrum(Y,samplerate) plots into current axes the power spectrum
%  estimate of signal Y. If Y has multiple rows, the average over rows is
%  done (treating 2nd index as time).
% By default smoothing over a 1 Hz bandwidth is done to make large datasets
%  plot faster.
%
% showpowerspectrum(Y,samplerate,smoothwid) also controls the smoothing
% width in Hz (default 1.0). zero does no smoothing (slow to plot).
%
% showpowerspectrum(Y,samplerate,smoothwid,linetype) also controls the
%  linetype, eg 'r--'.
%
% Usage hint: if too slow, only send a subset of the duration.
%
% Barnett 6/10/16

if nargin<3, smoothwid = 1.0; end         % freq smoothing width in Hz
if nargin<4, linetype = 'b-'; end

if nargin==0, test_showpowerspectrum; return; end
[M N] = size(Y);
PS = sum(abs(fft(Y'))'.^2,1);             % power-spectrum
df = samplerate/N;
freqgrid = (0:N-1)*df;
if smoothwid>0
  n = ceil(5.0*smoothwid/df);             % how many gauss pts to go each side
  smfun = exp(-.5*((-n:n)/smoothwid).^2);
  smfun = smfun/sum(smfun);               % normalize area
  PS = conv(PS,smfun,'same');             % smoothed spectrum
  j = 1:ceil(0.03*smoothwid/df):floor(N/2);   % indices to plot (so smooth)
else
  j = 1:floor(N/2);
end
fac = 2/(M*N*samplerate);                 % so correct variance per Hz
semilogy(freqgrid(j),fac*PS(j),linetype);
xlabel('freg (Hz)'); ylabel('spectral density (variance per Hz)');
axis tight

%%%%%%%%%%%%%%

function test_showpowerspectrum
figure; showpowerspectrum(randn(1,1e6),2e4,100.0);  % value should be at 1e-4
hold on; showpowerspectrum(randn(10,1e6),2e4,100.0,'r-'); % "
