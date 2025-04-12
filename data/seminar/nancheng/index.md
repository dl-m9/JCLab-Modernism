---
title: RingSFL, An Adaptive Split Federated Learning Towards Taming Client Heterogeneity @2023.10.9

date: 2023-10-09
---

Speaker: **Prof. Nan Cheng**. Professor, School of Telecommunications Engineering Xidian University, Xi’an, Shaanxi Province, China 

<!--more-->


## Abstract 

Federated learning (FL) has gained increasing attention due to its ability to collaboratively train while protecting client data privacy. However, in most wireless networks, such as vehicular networks, client heterogeneity exists, as different vehicular users have different computation capabilities. Vanilla FL cannot handle client heterogeneity, leading to a degradation in training efficiency due to stragglers, and is still vulnerable to privacy leakage. To address these issues, we propose RingSFL, a novel distributed learning scheme that integrates FL with a model split mechanism to adapt to client heterogeneity while maintaining data privacy. In RingSFL, all clients form a ring topology. For each client, instead of training the model locally, the model is split and trained among all clients along the ring through a pre-defined direction. By properly setting the propagation lengths of heterogeneous clients, the straggler effect is mitigated, and the training efficiency of the system is significantly enhanced. Additionally, since the local models is blended, it is less likely for an eavesdropper to obtain the complete model and recover the raw data, thus improving data privacy. The experimental results on both simulation and prototype systems show that RingSFL can achieve better convergence performance than benchmark methods on independently identically distributed (IID) and non-IID datasets, while effectively preventing eavesdroppers from recovering training data.

## Biography

 
Nan Cheng received the Ph.D. degree from the Department of Electrical and Computer Engineering, University of Waterloo in 2016, and B.E. degree and the M.S. degree from the Department of Electronics and Information Engineering, Tongji University, Shanghai, China, in 2009 and 2012, respectively. He worked as a Post-doctoral fellow with the Department of Electrical and Computer Engineering, University of Toronto, from 2017 to 2019. He is currently a professor with the State Key Lab. of ISN and with the School of Telecommunications Engineering, Xidian University, Shaanxi, China. He has published over 90 journal papers in IEEE Transactions and other top journals. He serves as an associate editor of IEEE Internet of Things Journal, IEEE Transactions on Vehicular Technology, IEEE Open Journal of the Communications Society, and Peer-to-Peer Networking and Applications, and serves/served as a guest editor for several journals. His current research focuses on B5G/6G, vehicular networks, AI-driven future networks, and space-air-ground integrated networks. 
 


