1. **项目概述**：简要说明这个项目是做什么的，解决了什么问题。
2. **系统架构**：描述各模块之间的关系，例如请求如何进入，经过哪些组件处理，最终输出什么。
3. **部署步骤**：包括如何打包（例如使用Maven或Gradle），如何启动（如Spring Boot的启动命令），以及环境变量配置等。
4. **注意事项**：例如，在什么情况下Job会阻塞，如何避免，以及如何通过监控接口发现问题。
5. **测试**：如何运行测试，测试用例的覆盖率要求等。
6. **API文档**：如果使用了Swagger，可以说明访问地址。
7. **日志说明**：日志文件的位置，如何切换日志级别，以及日志格式。
8. **监控接口**：给出MonitorController的具体接口路径和调用示例。

核心逻辑都在core包里面 JobCounter.java是用来追踪正在执行的Job的数量的
RetryJobCounter.java是用来追踪重试的Job的数量的
loadbalance这个包里面放的是负载均衡器，默认实现是RoundRobinLoadBalancer.java可以通过继承AbstractLoadBalancer.java来自己扩展其他的负载均衡方式 consumer这个包里面就是真正使用负载均衡器去请求scf接口的 ScheduledTasks.java这个类是用来获取scf的运行结果，释放Job并发的 JobController.java这个类里面有两个接口，一个是注册worker的，注册worker的参数格式在这里：bowong-parameter.json。另一个是job入队的，给客户端用的 MonitorController.java这个类里面提供了一些对Job 的监控，目前只能监控到Job的运行数量，有时候阻塞了可以请求这个接口看一下内存中有没有Job在跑

resources这个文件夹下面放的是配置文件，application.yml是总配置文件，application-dev.yml是开发环境，application-prod.yml是生产环境，application-test.yml是测试环境,logback-spring.xml是日志配置