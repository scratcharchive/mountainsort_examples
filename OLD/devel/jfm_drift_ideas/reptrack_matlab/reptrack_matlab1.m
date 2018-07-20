function reptrack_matlab1

close all;
addpath('view');

populations=[2000,2000,400,400];
xcenters=[0,0,0,0];
ycenters=[0,6,12,18];
drift_factors=[5,5,5,5]*1;
num_sections=20;
lambda_1=0.9;
lambda_2=0.1;
K=length(populations);

X=zeros(2,0);
labels=zeros(1,0);
tt=zeros(1,0);
for k=1:K
    X0=randn(2,populations(k));
    X0(1,:)=X0(1,:)+xcenters(k);
    X0(2,:)=X0(2,:)+ycenters(k);
    tt0=linspace(0,1,populations(k));
    X0(2,:)=X0(2,:)+tt0*drift_factors(k);
    X=cat(2,X,X0);
    labels=cat(2,labels,ones(1,populations(k))*k);
    tt=cat(2,tt,tt0);
end;

N=size(X,2);
perm=randsample(N,N);
X=X(:,perm);
labels=labels(:,perm);
tt=tt(:,perm);

figure;
plot(X(1,:),X(2,:),'b.');
axis equal;
drawnow;
pause(1);

section_assignments=zeros(1,N);
tau=1/num_sections;
for ss=1:num_sections
    t1=(ss-1)*tau;
    t2=ss*tau;
    section_assignments(find((t1<=tt)&(tt<t2)))=ss;
end;

[connections_1,proj_1]=get_connections(section_assignments,X,lambda_1,lambda_2);
[connections_2,proj_2]=get_connections(num_sections+1-section_assignments,X,lambda_1,lambda_2);

inds0=find(section_assignments==1);
for ct=1:5
    inds0=unique(proj_1(proj_2(inds0)));
end;

map=1:N;
for ct=1:5
    map=proj_1(proj_2(map));
end;

for pass=1:2
    if (pass==1)
        connections=connections_1;
        inds_last=find(section_assignments==num_sections);
    else
        connections=connections_2;
        inds_last=find(section_assignments==1);
    end;
    
    fA=figure;
    for ss=1:num_sections-1
        t0=max(tt(find(section_assignments==ss)));
        plot([t0,t0],[min(X(2,:)),max(X(2,:))],'g');
        hold on;
    end;
    plot(tt,X(2,:),'b.');
    
    for jj=1:length(inds_last)
        figure(fA);
        ind0=inds_last(jj);
        while (connections(ind0)>0)
            t1=tt(ind0);
            x1=X(2,ind0);
            t2=tt(connections(ind0));
            x2=X(2,connections(ind0));
            plot([t1,t2],[x1,x2],'k');
            ind0=connections(ind0);
        end;
        drawnow;
    end;
    pause(1);
end;

fA=figure;
for ss=1:num_sections-1
    t0=max(tt(find(section_assignments==ss)));
    plot([t0,t0],[min(X(2,:)),max(X(2,:))],'g');
    hold on;
end;
plot(tt,X(2,:),'b.');
for a=1:length(inds0)
    ind0=inds0(a);
    while (connections_2(ind0)>0)
        t1=tt(ind0);
        x1=X(2,ind0);
        t2=tt(connections(ind0));
        x2=X(2,connections(ind0));
        plot([t1,t2],[x1,x2],'k','linewidth',2);
        ind0=connections(ind0);
    end;
end;
pause(1);

figure; ms_view_clusters(X,map);
pause(1);

fA=figure;
for ss=1:num_sections-1
    t0=max(tt(find(section_assignments==ss)));
    plot([t0,t0],[min(X(2,:)),max(X(2,:))],'g');
    hold on;
end;
plot(tt,X(2,:),'b.');
inds=randsample(N,N);
for a=1:length(inds);
    figure(fA);
    ind0=inds(a);
    t1=tt(ind0);
    x1=X(2,ind0);
    t2=tt(map(ind0));
    x2=X(2,map(ind0));
    plot([t1,t2],[x1,x2],'k');
    ind0=connections(ind0);
    drawnow;
end;
pause(1);


function [connections,proj]=get_connections(section_assignments,X,lambda_1,lambda_2)
N=size(X,2);
num_sections=max(section_assignments);
num_knn=50;
S=3;
connections=ones(1,N)*(-1);
proj=ones(1,N)*(-1);
inds1=find(section_assignments==1);
proj(inds1)=inds1;
scores=zeros(S,N);
for a=2:num_sections
    inds_prev=find(section_assignments==(a-1));
    inds_cur=find(section_assignments==a);
    X_prev=X(:,inds_prev);
    X_cur=X(:,inds_cur);
    [IDX,D]=knnsearch(X_prev',X_cur','K',num_knn);
    for jj=1:length(inds_cur)
        candidates=IDX(jj,2:end);
        maxmins=max(scores(1,inds_prev(candidates)),D(jj,2:end));
        averages=(scores(2,inds_prev(candidates))*(a-1)+D(jj,2:end))/a;
        overall=lambda_1*maxmins+lambda_2*averages;
        [~,minind]=min(overall);
        scores(1,inds_cur(jj))=maxmins(minind(1));
        scores(2,inds_cur(jj))=averages(minind(1));
        scores(3,inds_cur(jj))=overall(minind(1));
        connections(inds_cur(jj))=inds_prev(candidates(minind(1)));
        proj(inds_cur(jj))=proj(connections(inds_cur(jj)));
    end;
end;