Reptrack -- an idea for spike sorting of drifting datasets
==========================================================

Let $E$ be a set of spike events. Represent these as tuples $y=(t,x)\in E$ where $t$ is the timestamp of the event and $x$ is the waveform in $MT$-dimensional space (M is the number of channels and T is the number of timepoints per event clip).

Let $d(y_1,y_2)$ be some sort of distance measure between the waveforms of $y_1=(t_1,x_1)$ and $y_2=(t_2,x_2)$. For example, this could be

.. math::

	d(y_1,y_2)=d\left((t_1,x_1),(t_2,x_2)\right)=\frac{|x_1-x_2|}{\sqrt{|x_1||x_2|}}.

Now, split $E$ into relatively short disjoint time sections of duration $\tau$ (for example $\tau=60\text{ seconds}$).

.. math::

	E = E_1\cup\dots\cup E_S

.. math::

	E_j = \{(t,x)\in E:(j-1)\tau\leq t<j\tau\}.

The idea is to select $\tau$ to be small relative to drift, but with each cluster having at least $10$ or so events in each section.

Define a path as

.. math::

	p = \left(y_a,y_{a+1},\dots,y_b\right)

where

.. math::

	y_j\in E_j.

We call this a path from $y_a$ to $y_b$.

Let $l(p)$ be some measure of the continuity of $p$. For example

.. math::

	l(p)=\lambda_1\max_{a\leq j<b} d(y_j,y_{j+1})+\lambda_2\frac{1}{b-a+1}\sum_{j=a}^b d(y_j,y_{j+1}),

for some weighting constants $\lambda_1$ and $\lambda_2$

This gives rise to a distance measure between events $y_1$ and $y_2$ not in the same section:


.. math::

	\DeclareMathOperator*{\min}{min}
	D(y_1,y_2) := \min_{\text{paths }p\\\text{  from}\\y_1\rightarrow y_2}l(p).

In other words, $D(y_1,y_2)$ is the continuity measure of the "best" path between $y_1$ and $y_2$. 

This function $D$ gives rise to two projection operators $\pi_1:E\rightarrow E_1$ and $\pi_2:E\rightarrow E_S$ mapping events to their "closest" events in the first and last sections respectively (we assume that these are unique). Starting with any event $y$ the iterates

.. math::

	y, (\pi_1\pi_2)y, (\pi_1\pi_2)^2y, \dots

must converge to a fixed point 

.. math::	

	\pi y := (\pi_1\pi_2)^\infty y. 

Indeed, we know that for any $y\in E_1$

.. math::	

	D(y,\pi_2 y) \geq D\left((\pi_1\pi_2)y,\pi_2 y\right)\geq D\left((\pi_1\pi_2)y,\pi_2 (\pi_1\pi_2)y\right)

Therefore, 

.. math::	

	q(y) \geq q((\pi_1\pi_2)y) \geq q((\pi_1\pi_2)^2y) \geq \dots

is a non-increasing sequence where

.. math::	

	q(y) := D(y,\pi_2 y).

This sequence (bounded below by zero) must therefore converge to a fixed point.

The hope is that each cluster is reqpresented by a unique fixed point in $E_1$ and that the mapping $y\mapsto \pi y$ is an accurate clustering.



Four clusters blended together due to drift:
|pic1|


.. Images stored in github issues for flatironinstitute/mountainsort_examples: images for docs 1

.. clusters
.. |pic1| image:: https://user-images.githubusercontent.com/3679296/33392236-763b7188-d509-11e7-85a5-f64a77e31535.jpg
	:width: 90%



Projections $\pi_1$ and $\pi_2$ together with the corresponding paths:
|pic2| |pic3|

.. proj_1
.. |pic2| image:: https://user-images.githubusercontent.com/3679296/33392240-766bb92e-d509-11e7-8282-27c4c45d4c70.jpg
	:width: 45%

.. proj_2
.. |pic3| image:: https://user-images.githubusercontent.com/3679296/33392242-768f9056-d509-11e7-8681-4c5440e90750.jpg
	:width: 45%



Best paths (left) and projection onto representative points (right):
|best_paths| |proj|

.. |best_paths| image:: https://user-images.githubusercontent.com/3679296/33392234-75fcf142-d509-11e7-827b-d48258301307.jpg
	:width: 45%

.. |proj| image:: https://user-images.githubusercontent.com/3679296/33392239-765cbc94-d509-11e7-9bdf-c89b9287ae05.jpg
	:width: 45%

Resulting clustering:
|clusters_labeled|

.. |clusters_labeled| image:: https://user-images.githubusercontent.com/3679296/33392237-764e2fc6-d509-11e7-88fe-7b4f91f2e18f.jpg
	:width: 90%

The problem with using $\lambda_1=0$:

|proj_1_lambda0| |proj_2_lambda0| |best_paths_lambda0|

.. |proj_1_lambda0| image:: https://user-images.githubusercontent.com/3679296/33392241-767fdd46-d509-11e7-892c-0e283cd82a88.jpg
	:width: 30%

.. |proj_2_lambda0| image:: https://user-images.githubusercontent.com/3679296/33392243-76aef91e-d509-11e7-9a55-dd465edbe782.jpg
	:width: 30%

.. |best_paths_lambda0| image:: https://user-images.githubusercontent.com/3679296/33392235-760b44ea-d509-11e7-9c12-860b64ad0ec6.jpg
	:width: 30%
