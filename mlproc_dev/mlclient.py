import time
from subprocess import Popen, PIPE
import random
import traceback
import os
import ipywidgets as widgets
import vdom
import copy
from IPython.core.display import HTML
from threading import Timer
from threading import Thread
import IPython
import subprocess
import json

class LogOutputWidget():
    def __init__(self):
        self._out=widgets.Output()
        self._text=''
            
    def display(self):
        display(self._out)
        self._out.clear_output(wait=True)
        with self._out:
            b=widgets.HTML(
                value='<pre>{}</pre>'.format(self._text),
                disabled=True
            )
            a = widgets.HBox([b], layout=widgets.Layout(height='150px', overflow_y='auto'))
            display(a)
    
    def setText(self,txt):
        self._text=txt

class MLJobWidget():
    def __init__(self):
        self._out=widgets.Output()
        self._info={
            'job_id':'',
            'processor_name':'',
            'inputs':{},
            'outputs':{},
            'parameters':{},
            'opts':{},
            'status':'',
            'console_output':''
        }
        self._dev_mode=False
        self._lari_info=None
        
    def setDevMode(self,val):
        self._dev_mode=val
    
    def display(self):
        display(self._out)
        self.refresh()
        
    def setInfo(self,info):
        self._info=copy.deepcopy(info)
        self.refresh()
        
    def _update_lari_info_from_lari_out_file(self,opts):
        if not 'lari_out' in opts:
            return None
        fname=opts['lari_out']
        if os.path.isfile(fname):
            try:
                with open(fname) as f:
                    self._lari_info = json.load(f)
            except Exception as e:
                print('Warning: Problem reading json file: {}'.format(fname))
                print(e)
    
    def refresh(self):
        self._out.clear_output(wait=True)
        
        info=self._info
        href=''
        self._update_lari_info_from_lari_out_file(info['opts'])
        if self._lari_info:
            kbucketgui_url='https://kbucketgui.herokuapp.com'
            if self._dev_mode:
                kbucketgui_url='http://localhost:5082'
            href='{}?lari_id={}&lari_job_id={}'.format(kbucketgui_url,self._lari_info['lari_id'],self._lari_info['lari_job_id'])

        if href:
            link=vdom.a(
                info['processor_name']+' ('+self._lari_info['lari_job_id']+')',
                href=href,
                target='_blank'
            )
        else:
            link=info['processor_name']
            
        A=vdom.table(
            vdom.tr(
                vdom.td(
                    info['status'],style={'color':self._status_color(info['status'])}
                ),
                vdom.td(
                    link
                )
            )
        )
        
        with self._out:
            display(A)
                    
    def _status_color(self,status):
        if status=='pending':
            return 'orange'
        elif status=='running':
            return 'magenta'
        elif status=='finished':
            return 'green'
        elif status=='error':
            return 'red'
        elif status=='stopped':
            return 'pink'
        else:
            return 'black'
            
class MLClient:
    def __init__(self):
        self._jobs={}
        self._job_ids=[]
        self._temporary_files_to_cleanup=[]
        self._is_finished=False
        self._last_status_string=''
        self._dev_mode=False

    def clearJobs(self):
        self.stop_all_processes()
        self._jobs={}
        self._job_ids=[]
            
    def jobIds(self):
        return self._job_ids
    
    def isFinished(self):
        return self._is_finished
    
    def setDevMode(self,val):
        self._dev_mode=val
    
    def jobInfo(self,id):
        job=self._jobs[id]
        return dict(
            job_id=job['id'],
            processor_name=job['processor_name'],
            inputs=job['inputs'],
            outputs=job['outputs'],
            parameters=job['parameters'],
            opts=job['opts'],
            status=job['status'],
            console_output=job['console_output']
        )
    
    def addProcess(self, processor_name, inputs=None, outputs=None, parameters=None, opts=None):
        if inputs is None:
            A=processor_name
            processor_name=A['processor_name']
            inputs=A.get('inputs',{})
            outputs=A.get('outputs',{})
            parameters=A.get('parameters',{})
            opts=A.get('opts',{})
        if not inputs:
            inputs={}
        if not outputs:
            outputs={}
        if not parameters:
            parameters={}
        if not opts:
            opts={}
        for okey in outputs:
          val=outputs[okey]
          if val is True:
            tmpfile='tmp.'+processor_name+'.'+okey+'.'+self.make_random_id(10)+'.prv'
            outputs[okey]=tmpfile
            self._temporary_files_to_cleanup.append(tmpfile)
        opts2=copy.deepcopy(opts)
        tmp_lari_out_file='tmp.'+processor_name+'.lari_out.'+self.make_random_id(10)+'.json'
        opts2['lari_out']=tmp_lari_out_file
        self._temporary_files_to_cleanup.append(tmp_lari_out_file)
        job_id = self.make_random_id(10)
        JJ={
            'id':job_id,
            'processor_name':processor_name,
            'inputs':inputs,
            'outputs':outputs,
            'parameters':parameters,
            'opts':opts2,
        }
        JJ['input_files']=self.flatten_iops(inputs)
        JJ['output_files']=self.flatten_iops(outputs)
        JJ['status']='pending'
        JJ['console_output']=''
        W=MLJobWidget()
        W.setDevMode(self._dev_mode)
        JJ['widget']=W
        self._job_ids.append(job_id)
        self._jobs[job_id]=JJ
        W.display()
        self._update_job_widget(job_id)
        return {
          'outputs':outputs
        }
    
    def _update_job_widget(self,job_id):
        W=self._jobs[job_id]['widget']
        W.setInfo(self.jobInfo(job_id))
        
    def next_iteration(self):
        try:
            last_status_string=''
            num_running = 0
            num_finished = 0
            num_pending = 0
            num_canceled = 0
            num_stopped = 0
            for id in self._job_ids:
                job = self._jobs[id]
                if job['status'] == 'running':
                  self.check_running_job(job)
            for id in self._job_ids:
                job = self._jobs[id]
                if job['status'] == 'running':
                    num_running=num_running+1
                elif job['status'] == 'error':
                    raise Exception('Error running process {}: {}'.format(job['processor_name'],job['error']))
                elif job['status'] == 'finished':
                    num_finished=num_finished+1
                elif job['status'] == 'pending':
                    if self.input_files_are_ready(job):
                        self.start_job(job)
                        num_running=num_running+1
                    else:
                        num_pending=num_pending+1
                elif job['status'] == 'canceled':
                    num_canceled=num_canceled+1
                elif job['status'] == 'stopped':
                    num_stopped = num_stopped + 1
            status_string='JOBS: pending:{} running:{} finished:{}'.format(num_pending,num_running,num_finished)
            if status_string != self._last_status_string:
                print (status_string)
            self._last_status_string=status_string
            if (num_running == 0) and (num_pending == 0):
                self.cleanup()
                return False
            if (num_running == 0) and (num_pending > 0):
                raise Exception('Error running pipeline. Are there cyclic dependencies?')
            return True
        except Exception as e:
            self._stop_everything()
            raise e
        
    def _stop_everything(self):
        for id in self._job_ids:
            job = self._jobs[id]
            if job['status']=='running':
                job['status']='stopped'
            if job['status']=='pending':
                job['status']='canceled'
        self.stop_all_processes()
        self.cleanup()
        
    def run(self):
        print('Running pipeline...')
        #B=widgets.Button(description='next iteration')
        #def on_click(b):
        #    self.next_iteration()
        #    if self._job_monitor:
        #        self._job_monitor.refresh()
        #B.on_click(on_click)
        #display(B)
        self._last_status_string=''
        
        while True:
            ret=self.next_iteration()
            if not ret:
                break
            time.sleep(1)
            #IPython.get_ipython().kernel.do_one_iteration()
        self._is_finished=True
        print('Finished pipeline.')
            
    def start(self):
        def do_run():
            self.run()
        Timer(1,do_run,()).start()

    def cleanup(self):
        for j in range(len(self._temporary_files_to_cleanup)):
          fname=self._temporary_files_to_cleanup[j]
          if os.path.isfile(fname):
            os.remove(fname)
        self._temporary_files_to_cleanup=[]
    
    def start_job(self, job):
        job['status']='running'
        inputs_list=self.create_args_list(job['inputs'])
        outputs_list=self.create_args_list(job['outputs'])
        params_list=self.create_args_list(job['parameters'])
        opts_list=[]
        for key in job['opts']:
          val=job['opts'][key]
          if val is True:
            opts_list.append('--'+key)
          elif val is False:
            pass
          else:
            if val != 'mode':
              opts_list.append('--'+key+'='+val)
        mode=job['opts'].get('mode','run')
        cmd = 'ml-{}-process {} -i {} -o {} -p {} {}'.format(mode,job['processor_name'],' '.join(inputs_list),' '.join(outputs_list),' '.join(params_list),' '.join(opts_list))
        print ('Running: {}'.format(cmd))
        try:
            P=self.start_child_process(cmd)
            job['child_process']=P
            self._update_job_widget(job['id'])
        except Exception as e:
            self._print_color('FgRed',traceback.format_exc())
            job['status']='error'
            job['error']='Error running command: {}'.format(cmd)
            self._update_job_widget(job['id'])
        
    #todo: check for child_process stopped and then set status to finished
    
    def input_files_are_ready(self,job):
        for fname in job['input_files']:
            for id in self._job_ids:
                job2=self._jobs[id]
                if (job2['status']=='pending') or (job2['status']=='running'):
                    if (fname in job2['output_files']) or (fname+'.prv' in job2['output_files']):
                        if job['id'] == job2['id']:
                            raise('Input file cannot be same as output file in {}'.format(job['processor_name']))
                        return False
        return True

    def flatten_iops(self,X):
      ret = {}
      for key in X:
        val = X[key]
        if type(val) == list:
          for i in range(len(val)):
            ret[val[i]]=True
        elif type(val) == dict:
          for i in val:
            ret[val[i]]=True
        else:
          ret[val] = True
          
      return ret

    def start_child_process(self,cmd):
        list=cmd.split(' ')
        return Popen(list, stdout=PIPE, stderr=subprocess.STDOUT)
        #return Popen(list)

    def check_running_job(self,job):
        P=job['child_process']
        #self._handle_process_output(P,job)
        retcode=P.poll()
        if retcode is not None:
            if retcode == 0:
                job['status']='finished'
                self._handle_process_output(P,job)
            else:
                job['status']='error'
                job['error']='Process returned with non-zero error code ({})'.format(retcode)
            job['child_process']=None
            self._update_job_widget(job['id'])
            return
        else:
            self._update_job_widget(job['id'])

    def _handle_process_output(self,P,job):
        start_time = time.time()
        while True:
            output_stdout= P.stdout.readline().decode('utf-8')
            #output_stderr = P.stderr.read().decode('utf-8')
            output_stderr=''
            if (not output_stdout) and (not output_stderr):
                break
            if output_stdout:
                job['console_output']=job['console_output']+output_stdout
                pass
            #if output_stderr:
            #    job['console_output']=job['console_output']+output_stderr
            #    pass
            
            #elapsed_time = time.time() - start_time
            #if elapsed_time>0.5:
            #    break
            
            #if output_stdout:
            #    self._print_color ('FgBlue',output_stdout.strip().decode())
            #if output_stderr:
            #    self._print_color ('FgRed',output_stderr.strip().decode())

    def create_args_list(self,iops):
      ret = []
      for key in iops:
        val = iops[key]
        if (type(val) == list):
          for i in range(len(val)):
            ret.append('{}:{}'.format(key,val[i]))
        else:
          ret.append('{}:{}'.format(key,val))
      return ret

    def stop_all_processes(self):
      for id in self._job_ids:
        job=self._jobs[id]
        if 'child_process' in job:
          P=job['child_process']
          if P:
            P.terminate()

    def make_random_id(self,len):
      possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      return ''.join(random.choice(possible) for _ in range(len))

    def _print_color(self,col,txt):
      # terminal color codes
      ccc = {
          "Reset": "\x1b[0m",
          "Bright": "\x1b[1m",
          "Dim": "\x1b[2m",
          "Underscore": "\x1b[4m",
          "Blink": "\x1b[5m",
          "Reverse": "\x1b[7m",
          "Hidden": "\x1b[8m",
          "FgBlack": "\x1b[30m",
          "FgRed": "\x1b[31m",
          "FgGreen": "\x1b[32m",
          "FgYellow": "\x1b[33m",
          "FgBlue": "\x1b[34m",
          "FgMagenta": "\x1b[35m",
          "FgCyan": "\x1b[36m",
          "FgWhite": "\x1b[37m",
          "BgBlack": "\x1b[40m",
          "BgRed": "\x1b[41m",
          "BgGreen": "\x1b[42m",
          "BgYellow": "\x1b[43m",
          "BgBlue": "\x1b[44m",
          "BgMagenta": "\x1b[45m",
          "BgCyan": "\x1b[46m",
          "BgWhite": "\x1b[47m",
      };
      print (ccc[col]+txt+ccc['Reset'])
